import { create } from 'zustand';
import { donantesApi } from '../api/donantesApi';
import { getDonanteEmail } from './donanteUtils';
import type {
  CrearPersonaHumanaDTO,
  CrearPersonaJuridicaDTO,
  Donante,
  DonanteFormData,
} from './types';

export const INITIAL_MOCK_DONANTES: Donante[] = [
  {
    id: 1,
    persona: {
      id: 101,
      nombre: 'Juan',
      apellido: 'Pérez',
      nroDocumento: '12345678',
      genero: 'Masculino',
      fechaNacimiento: '1985-04-12',
      edad: 41,
      tipoPersona: 'HUMANA',
      direccion: {
        calle: 'Av. Corrientes',
        altura: 1450,
        piso: '4',
        depto: 'B',
        codigoPostal: '1043',
      },
      medioDeContacto: {
        EMAIL: ['juan.perez@example.com'],
        TELEFONO: ['1122334455'],
        WHATSAPP: ['1122334455'],
      },
      medioPredeterminado: {
        medio: 'EMAIL',
        valor: 'juan.perez@example.com',
      },
    },
  },
  {
    id: 2,
    persona: {
      id: 102,
      razonSocial: 'Fundación Ayuda Comunitaria',
      tipo: 'ONG',
      rubro: 'Desarrollo Social y Comunitario',
      tipoPersona: 'JURIDICA',
      direccion: {
        calle: 'San Martín',
        altura: 890,
        codigoPostal: '1004',
      },
      medioDeContacto: {
        EMAIL: ['contacto@fundacionayuda.org'],
        TELEFONO: ['1199887766'],
      },
      medioPredeterminado: {
        medio: 'EMAIL',
        valor: 'contacto@fundacionayuda.org',
      },
    },
  },
  {
    id: 3,
    persona: {
      id: 103,
      nombre: 'María',
      apellido: 'Gómez',
      nroDocumento: '87654321',
      genero: 'Femenino',
      fechaNacimiento: '1992-09-24',
      edad: 34,
      tipoPersona: 'HUMANA',
      direccion: {
        calle: 'Belgrano',
        altura: 320,
        codigoPostal: '5000',
      },
      medioDeContacto: {
        EMAIL: ['maria.gomez@example.com'],
        TELEFONO: ['1155667788'],
      },
      medioPredeterminado: {
        medio: 'EMAIL',
        valor: 'maria.gomez@example.com',
      },
    },
  },
  {
    id: 4,
    persona: {
      id: 104,
      razonSocial: 'Distribuidora Andina S.A.',
      tipo: 'EMPRESA',
      rubro: 'Alimentos y Logística de Fríos',
      tipoPersona: 'JURIDICA',
      direccion: {
        calle: 'Av. Libertador',
        altura: 5200,
        piso: '12',
        codigoPostal: '1426',
      },
      medioDeContacto: {
        EMAIL: ['donaciones@andina.com.ar'],
        TELEFONO: ['1144332211'],
        WHATSAPP: ['1144332211'],
      },
      medioPredeterminado: {
        medio: 'EMAIL',
        valor: 'donaciones@andina.com.ar',
      },
    },
  },
];

export interface CreateDonanteResult {
  donante: Donante;
  isUpdated: boolean;
}

interface DonantesState {
  donantes: Donante[];
  isInitialized: boolean;
  selectedDonante: Donante | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  setSearchQuery: (query: string) => void;
  setSelectedDonante: (donante: Donante | null) => void;
  fetchDonantes: () => Promise<void>;
  createHumano: (dto: CrearPersonaHumanaDTO) => Promise<CreateDonanteResult>;
  createJuridico: (dto: CrearPersonaJuridicaDTO) => Promise<CreateDonanteResult>;
  updateDonante: (originalEmail: string, formData: DonanteFormData) => Promise<void>;
  deleteDonante: (email: string) => Promise<void>;
  importarCSV: (file: File) => Promise<{ success: boolean; count: number; message: string }>;
  clearError: () => void;
}

export const useDonantesStore = create<DonantesState>((set, get) => ({
  donantes: [],
  isInitialized: false,
  selectedDonante: null,
  searchQuery: '',
  isLoading: false,
  error: null,

  setSearchQuery: (searchQuery: string) => set({ searchQuery }),
  setSelectedDonante: (selectedDonante: Donante | null) => set({ selectedDonante }),
  clearError: () => set({ error: null }),

  fetchDonantes: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await donantesApi.getAll();
      if (Array.isArray(data) && data.length > 0) {
        set({ donantes: data, isLoading: false, isInitialized: true });
      } else {
        // Mantiene mocks locales si la base está vacía
        set({ donantes: INITIAL_MOCK_DONANTES, isLoading: false, isInitialized: true });
      }
    } catch {
      // Fallback a mocks si el microservicio está apagado
      set({ donantes: INITIAL_MOCK_DONANTES, isLoading: false, isInitialized: true });
    }
  },

  createHumano: async (dto: CrearPersonaHumanaDTO) => {
    set({ isLoading: true, error: null });
    const targetEmail = (
      dto.mediosDeContacto.find((m) => m.medio === 'EMAIL')?.valor ||
      (dto.medioPredeterminado.medio === 'EMAIL' ? dto.medioPredeterminado.valor : '') ||
      ''
    ).toLowerCase().trim();

    const isExisting = get().donantes.some((d) => {
      const email = getDonanteEmail(d).toLowerCase();
      return targetEmail !== '' && email === targetEmail;
    });

    try {
      const created = await donantesApi.createHumano(dto);
      set((state) => {
        const idx = state.donantes.findIndex((d) => {
          const email = getDonanteEmail(d).toLowerCase();
          return (targetEmail !== '' && email === targetEmail) || String(d.id) === String(created.id);
        });

        if (idx !== -1) {
          const updated = [...state.donantes];
          updated[idx] = created;
          return { donantes: updated, isLoading: false };
        }
        return { donantes: [created, ...state.donantes], isLoading: false };
      });
      return { donante: created, isUpdated: isExisting };
    } catch {
      // Creación/actualización local reactiva de fallback
      const existingDonor = get().donantes.find((d) => {
        const email = getDonanteEmail(d).toLowerCase();
        return targetEmail !== '' && email === targetEmail;
      });

      const mockCreated: Donante = {
        id: existingDonor?.id || Date.now(),
        persona: {
          id: existingDonor?.persona?.id || Date.now() + 1,
          nombre: dto.nombre,
          apellido: dto.apellido,
          nroDocumento: dto.nroDocumento,
          genero: dto.genero,
          fechaNacimiento: dto.fechaNacimiento,
          edad: dto.edad,
          tipoPersona: 'HUMANA',
          direccion: dto.direccion,
          medioDeContacto: {
            EMAIL: dto.mediosDeContacto
              .filter((m) => m.medio === 'EMAIL')
              .map((m) => m.valor),
            SMS: dto.mediosDeContacto
              .filter((m) => m.medio === 'SMS')
              .map((m) => m.valor),
            WHATSAPP: dto.mediosDeContacto
              .filter((m) => m.medio === 'WHATSAPP')
              .map((m) => m.valor),
          },
          medioPredeterminado: dto.medioPredeterminado,
        },
      };

      set((state) => {
        const idx = state.donantes.findIndex((d) => {
          const email = getDonanteEmail(d).toLowerCase();
          return targetEmail !== '' && email === targetEmail;
        });

        if (idx !== -1) {
          const updated = [...state.donantes];
          updated[idx] = mockCreated;
          return { donantes: updated, isLoading: false };
        }
        return { donantes: [mockCreated, ...state.donantes], isLoading: false };
      });
      return { donante: mockCreated, isUpdated: isExisting };
    }
  },

  createJuridico: async (dto: CrearPersonaJuridicaDTO) => {
    set({ isLoading: true, error: null });
    const targetEmail = (
      dto.mediosDeContacto.find((m) => m.medio === 'EMAIL')?.valor ||
      (dto.medioPredeterminado.medio === 'EMAIL' ? dto.medioPredeterminado.valor : '') ||
      ''
    ).toLowerCase().trim();

    const isExisting = get().donantes.some((d) => {
      const email = getDonanteEmail(d).toLowerCase();
      return targetEmail !== '' && email === targetEmail;
    });

    try {
      const created = await donantesApi.createJuridico(dto);
      set((state) => {
        const idx = state.donantes.findIndex((d) => {
          const email = getDonanteEmail(d).toLowerCase();
          return (targetEmail !== '' && email === targetEmail) || String(d.id) === String(created.id);
        });

        if (idx !== -1) {
          const updated = [...state.donantes];
          updated[idx] = created;
          return { donantes: updated, isLoading: false };
        }
        return { donantes: [created, ...state.donantes], isLoading: false };
      });
      return { donante: created, isUpdated: isExisting };
    } catch {
      // Creación/actualización local reactiva de fallback
      const existingDonor = get().donantes.find((d) => {
        const email = getDonanteEmail(d).toLowerCase();
        return targetEmail !== '' && email === targetEmail;
      });

      const mockCreated: Donante = {
        id: existingDonor?.id || Date.now(),
        persona: {
          id: existingDonor?.persona?.id || Date.now() + 1,
          razonSocial: dto.razonSocial,
          tipo: dto.tipo,
          rubro: dto.rubro,
          personasRepresentantes: dto.representantes,
          tipoPersona: 'JURIDICA',
          direccion: dto.direccion,
          medioDeContacto: {
            EMAIL: dto.mediosDeContacto
              .filter((m) => m.medio === 'EMAIL')
              .map((m) => m.valor),
            SMS: dto.mediosDeContacto
              .filter((m) => m.medio === 'SMS')
              .map((m) => m.valor),
            WHATSAPP: dto.mediosDeContacto
              .filter((m) => m.medio === 'WHATSAPP')
              .map((m) => m.valor),
          },
          medioPredeterminado: dto.medioPredeterminado,
        },
      };

      set((state) => {
        const idx = state.donantes.findIndex((d) => {
          const email = getDonanteEmail(d).toLowerCase();
          return targetEmail !== '' && email === targetEmail;
        });

        if (idx !== -1) {
          const updated = [...state.donantes];
          updated[idx] = mockCreated;
          return { donantes: updated, isLoading: false };
        }
        return { donantes: [mockCreated, ...state.donantes], isLoading: false };
      });
      return { donante: mockCreated, isUpdated: isExisting };
    }
  },

  updateDonante: async (originalEmail: string, formData: DonanteFormData) => {
    set({ isLoading: true, error: null });

    const direccion =
      formData.calle.trim() || formData.altura.trim()
        ? {
            calle: formData.calle.trim(),
            calle1: formData.calle.trim(),
            altura: Number(formData.altura) || 0,
            piso: formData.piso ? Number(formData.piso) || 0 : undefined,
            depto: formData.depto.trim() || undefined,
            departamento: formData.depto.trim() || undefined,
            codigoPostal: formData.codigoPostal.trim() || undefined,
          }
        : undefined;

    const telefonoMedio =
      formData.medioPreferido === 'WHATSAPP' ? ('WHATSAPP' as const) : ('SMS' as const);

    const mediosDeContacto = [
      ...(formData.email ? [{ medio: 'EMAIL' as const, valor: formData.email }] : []),
      ...(formData.telefono
        ? [{ medio: telefonoMedio, valor: formData.telefono }]
        : []),
    ];

    const medioPredeterminado = {
      medio: formData.medioPreferido,
      valor:
        formData.medioPreferido === 'EMAIL'
          ? formData.email
          : formData.telefono || formData.email,
    };

    try {
      if (formData.tipoPersona === 'HUMANA') {
        const dto: CrearPersonaHumanaDTO = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          nroDocumento: formData.nroDocumento,
          genero: formData.genero,
          fechaNacimiento: formData.fechaNacimiento,
          direccion,
          mediosDeContacto,
          medioPredeterminado,
        };
        await donantesApi.updateHumano(originalEmail, dto);
      } else {
        const representantes =
          formData.representanteNombre && formData.representanteApellido
            ? [
                {
                  nombre: formData.representanteNombre,
                  apellido: formData.representanteApellido,
                  nroDocumento: Number(formData.representanteDocumento) || 0,
                },
              ]
            : undefined;

        const dto: CrearPersonaJuridicaDTO = {
          razonSocial: formData.razonSocial,
          tipo: formData.tipoOrganizacion,
          rubro: formData.rubro,
          representantes,
          direccion,
          mediosDeContacto,
          medioPredeterminado,
        };
        await donantesApi.updateJuridico(originalEmail, dto);
      }
    } catch {
      // Ignora error si es backend offline para actualizar estado local
    }

    // Actualiza el estado reactivo local
    set((state) => {
      const updated = state.donantes.map((d) => {
        const currentEmail = getDonanteEmail(d).toLowerCase();
        if (currentEmail === originalEmail.toLowerCase().trim()) {
          const representantes =
            formData.representanteNombre && formData.representanteApellido
              ? [
                  {
                    nombre: formData.representanteNombre,
                    apellido: formData.representanteApellido,
                    nroDocumento: Number(formData.representanteDocumento) || 0,
                  },
                ]
              : undefined;

          return {
            ...d,
            persona: {
              ...d.persona,
              nombre: formData.tipoPersona === 'HUMANA' ? formData.nombre : undefined,
              apellido:
                formData.tipoPersona === 'HUMANA' ? formData.apellido : undefined,
              nroDocumento:
                formData.tipoPersona === 'HUMANA'
                  ? formData.nroDocumento
                  : undefined,
              genero: formData.tipoPersona === 'HUMANA' ? formData.genero : undefined,
              fechaNacimiento:
                formData.tipoPersona === 'HUMANA'
                  ? formData.fechaNacimiento
                  : undefined,
              razonSocial:
                formData.tipoPersona === 'JURIDICA'
                  ? formData.razonSocial
                  : undefined,
              tipo:
                formData.tipoPersona === 'JURIDICA'
                  ? formData.tipoOrganizacion
                  : undefined,
              rubro:
                formData.tipoPersona === 'JURIDICA' ? formData.rubro : undefined,
              personasRepresentantes:
                formData.tipoPersona === 'JURIDICA'
                  ? representantes
                  : undefined,
              tipoPersona: formData.tipoPersona,
              direccion,
              medioDeContacto: {
                EMAIL: formData.email ? [formData.email] : [],
                ...(formData.telefono
                  ? { [telefonoMedio]: [formData.telefono] }
                  : {}),
              },
              medioPredeterminado,
            },
          };
        }
        return d;
      });

      return {
        donantes: updated,
        selectedDonante: null,
        isLoading: false,
      };
    });
  },

  deleteDonante: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await donantesApi.delete(email);
    } catch {
      // Fallback a eliminación en memoria si backend está offline
    }

    set((state) => ({
      donantes: state.donantes.filter((d) => {
        const dEmail = getDonanteEmail(d).toLowerCase();
        return dEmail !== email.toLowerCase().trim();
      }),
      selectedDonante: null,
      isLoading: false,
    }));
  },

  importarCSV: async (file: File) => {
    set({ isLoading: true, error: null });
    try {
      const res = await donantesApi.importarCSV(file);
      if (res.data && res.data.length > 0) {
        set((state) => ({
          donantes: [...res.data!, ...state.donantes],
          isLoading: false,
        }));
      } else {
        await get().fetchDonantes();
      }
      return {
        success: true,
        count: res.data?.length || 0,
        message: res.message || 'Donantes importados con éxito',
      };
    } catch {
      // Fallback: procesar CSV localmente para que funcione aunque el microservicio esté caído
      return new Promise<{ success: boolean; count: number; message: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (!text) {
            set({ isLoading: false });
            resolve({ success: false, count: 0, message: 'Archivo vacío o ilegible' });
            return;
          }

          const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
          const currentDonantes = [...get().donantes];
          let nuevosCount = 0;
          let actualizadosCount = 0;

          // Saltear encabezado si existe
          const dataLines = lines[0].toLowerCase().includes('tipopersona')
            ? lines.slice(1)
            : lines;

          dataLines.forEach((line, idx) => {
            const cols = line.split(',').map((c) => c.trim());
            if (cols.length >= 4) {
              const tipoPersona = cols[0].toUpperCase().includes('JURID')
                ? 'JURIDICA'
                : 'HUMANA';
              const doc = cols[2] || `DOC-${Date.now()}-${idx}`;
              const nombreOrRazon = cols[3] || 'Importado';
              const email = cols[4] || `donante${Date.now()}${idx}@mail.com`;
              const tel = cols[5] || '';

              const targetEmail = email.toLowerCase().trim();
              const existingIdx = currentDonantes.findIndex((d) => {
                const dEmail = getDonanteEmail(d).toLowerCase();
                return dEmail === targetEmail;
              });

              const donanteItem: Donante = {
                id: existingIdx !== -1 ? currentDonantes[existingIdx].id : Date.now() + idx,
                persona: {
                  id: existingIdx !== -1 ? currentDonantes[existingIdx].persona.id : Date.now() + 100 + idx,
                  tipoPersona,
                  nombre: tipoPersona === 'HUMANA' ? nombreOrRazon : undefined,
                  razonSocial:
                    tipoPersona === 'JURIDICA' ? nombreOrRazon : undefined,
                  nroDocumento: doc,
                  tipo: tipoPersona === 'JURIDICA' ? 'ONG' : undefined,
                  medioDeContacto: {
                    EMAIL: [email],
                    SMS: tel ? [tel] : [],
                  },
                  medioPredeterminado: {
                    medio: 'EMAIL',
                    valor: email,
                  },
                },
              };

              if (existingIdx !== -1) {
                currentDonantes[existingIdx] = donanteItem;
                actualizadosCount++;
              } else {
                currentDonantes.unshift(donanteItem);
                nuevosCount++;
              }
            }
          });

          set({
            donantes: currentDonantes,
            isLoading: false,
          });

          resolve({
            success: true,
            count: nuevosCount + actualizadosCount,
            message: `Procesados ${nuevosCount + actualizadosCount} donantes (${nuevosCount} creados, ${actualizadosCount} actualizados por correo registrado).`,
          });
        };
        reader.readAsText(file);
      });
    }
  },
}));

