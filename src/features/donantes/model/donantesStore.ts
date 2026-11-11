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

export interface CsvImportProgress {
  currentBatch: number;
  totalBatches: number;
  processedRows: number;
  totalRows: number;
  stage: string;
}

interface DonantesState {
  donantes: Donante[];
  isInitialized: boolean;
  isUsingMockData: boolean;
  selectedDonante: Donante | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  setSearchQuery: (query: string) => void;
  setSelectedDonante: (donante: Donante | null) => void;
  fetchDonantes: (force?: boolean) => Promise<void>;
  createHumano: (dto: CrearPersonaHumanaDTO) => Promise<CreateDonanteResult>;
  createJuridico: (dto: CrearPersonaJuridicaDTO) => Promise<CreateDonanteResult>;
  updateDonante: (originalEmail: string, formData: DonanteFormData) => Promise<void>;
  deleteDonante: (email: string) => Promise<void>;
  importarCSV: (
    file: File,
    onProgress?: (progress: CsvImportProgress) => void
  ) => Promise<{ success: boolean; count: number; message: string }>;
  clearError: () => void;
}

export const useDonantesStore = create<DonantesState>((set, get) => ({
  donantes: [],
  isInitialized: false,
  isUsingMockData: false,
  selectedDonante: null,
  searchQuery: '',
  isLoading: false,
  error: null,

  setSearchQuery: (searchQuery: string) => set({ searchQuery }),
  setSelectedDonante: (selectedDonante: Donante | null) => set({ selectedDonante }),
  clearError: () => set({ error: null }),

  fetchDonantes: async (force = false) => {
    const state = get();
    if (state.isLoading) return;
    if (!force && state.isInitialized && !state.isUsingMockData && !state.error) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const data = await donantesApi.getAll();
      if (Array.isArray(data)) {
        set({
          donantes: data,
          isUsingMockData: false,
          error: null,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        set({
          donantes: INITIAL_MOCK_DONANTES,
          isUsingMockData: true,
          error: 'El servidor devolvió un formato inesperado. Mostrando datos mockup locales.',
          isLoading: false,
          isInitialized: true,
        });
      }
    } catch {
      // Fallback a mocks si el microservicio está apagado o devolvió error, avisando explícitamente
      set((prev) => {
        const hasRealData = prev.donantes.length > 0 && !prev.isUsingMockData;
        return {
          donantes: hasRealData ? prev.donantes : INITIAL_MOCK_DONANTES,
          isUsingMockData: !hasRealData,
          error: hasRealData
            ? 'No se pudo actualizar el padrón desde el servidor. Mostrando la última copia en memoria.'
            : 'No se pudo conectar con el servicio de donaciones. Se están mostrando 4 registros mockup de prueba.',
          isLoading: false,
          isInitialized: true,
        };
      });
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

  importarCSV: async (file: File, onProgress?: (progress: CsvImportProgress) => void) => {
    set({ isLoading: true, error: null });

    // Si es un archivo .xlsx (binario), se envía directo al backend
    if (file.name.toLowerCase().endsWith('.xlsx')) {
      try {
        onProgress?.({
          currentBatch: 1,
          totalBatches: 1,
          processedRows: 0,
          totalRows: 1,
          stage: 'Procesando archivo Excel en el servidor...',
        });
        const res = await donantesApi.importarCSV(file);
        set({ isLoading: false });
        if (!res.success) {
          return {
            success: false,
            count: 0,
            message: res.message || 'El servidor reportó un error al importar el archivo.',
          };
        }
        await get().fetchDonantes(true);
        return {
          success: true,
          count: get().donantes.length,
          message: res.message || 'Donantes importados con éxito.',
        };
      } catch {
        set({ isLoading: false });
        await get().fetchDonantes(true);
        return {
          success: false,
          count: 0,
          message: 'Error de conexión o tiempo de espera agotado al subir el archivo.',
        };
      }
    }

    // Para CSV: 1) Comprobación y deduplicación local en O(N), 2) Envío por lotes de 2.500 registros
    const CSV_BATCH_SIZE = 2500;
    let processedRows = 0;
    let totalUniqueRows = 0;

    try {
      const rawText = await file.text();
      const text = rawText.replace(/^\uFEFF/, ''); // Quitar BOM UTF-8 si existe
      const allLines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

      if (allLines.length === 0) {
        set({ isLoading: false });
        return { success: false, count: 0, message: 'El archivo CSV está vacío.' };
      }

      const hasHeader = allLines[0].toLowerCase().includes('tipopersona');
      const headerLine = hasHeader
        ? allLines[0]
        : 'TipoPersona,TipoDoc,Documento,Nombre/Razón Social,Email,Teléfono';
      const dataLines = hasHeader ? allLines.slice(1) : allLines;

      // Índice O(1) de emails actualmente cargados en el store local
      const existingEmails = new Set<string>();
      for (const d of get().donantes) {
        const em = getDonanteEmail(d).toLowerCase().trim();
        if (em) existingEmails.add(em);
      }

      // Deduplicar filas del propio CSV por email (conservando la última aparición)
      const uniqueByEmail = new Map<string, string>();
      for (const line of dataLines) {
        const cols = line.split(',');
        if (cols.length >= 5) {
          const email = cols[4].trim().toLowerCase();
          if (email) {
            uniqueByEmail.set(email, line);
          }
        }
      }

      // Separar localmente en registros a ACTUALIZAR (email existente) y registros NUEVOS (alta)
      const linesToUpdate: string[] = [];
      const linesToInsert: string[] = [];

      for (const [email, line] of uniqueByEmail.entries()) {
        if (existingEmails.has(email)) {
          linesToUpdate.push(line);
        } else {
          linesToInsert.push(line);
        }
      }

      // Primero enviamos las actualizaciones y luego las altas
      const orderedLines = [...linesToUpdate, ...linesToInsert];
      totalUniqueRows = orderedLines.length;

      if (totalUniqueRows === 0) {
        set({ isLoading: false });
        return {
          success: false,
          count: 0,
          message: 'No se encontraron registros válidos con email en el archivo CSV.',
        };
      }

      const totalBatches = Math.ceil(totalUniqueRows / CSV_BATCH_SIZE);

      for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
        const start = batchIdx * CSV_BATCH_SIZE;
        const chunk = orderedLines.slice(start, start + CSV_BATCH_SIZE);

        onProgress?.({
          currentBatch: batchIdx + 1,
          totalBatches,
          processedRows,
          totalRows: totalUniqueRows,
          stage: `Enviando lote ${batchIdx + 1} de ${totalBatches} (${processedRows} / ${totalUniqueRows} registros)...`,
        });

        const chunkCsvContent = `${headerLine}\n${chunk.join('\n')}\n`;
        const chunkFile = new File([chunkCsvContent], `lote_${batchIdx + 1}_${file.name}`, {
          type: 'text/csv;charset=utf-8;',
        });

        const res = await donantesApi.importarCSV(chunkFile);
        if (res && res.success === false) {
          throw new Error(res.message || `Error en el lote ${batchIdx + 1}`);
        }

        processedRows += chunk.length;
      }

      onProgress?.({
        currentBatch: totalBatches,
        totalBatches,
        processedRows: totalUniqueRows,
        totalRows: totalUniqueRows,
        stage: 'Sincronizando padrón actualizado con el servidor...',
      });

      set({ isLoading: false });
      await get().fetchDonantes(true);

      return {
        success: true,
        count: totalUniqueRows,
        message: `Se procesaron ${totalUniqueRows} donantes exitosamente (${linesToInsert.length} nuevos dados de alta y ${linesToUpdate.length} actualizados por email).`,
      };
    } catch (err) {
      set({ isLoading: false });
      // Sincronizamos el estado real desde el servidor para no mostrar datos falsos en memoria
      await get().fetchDonantes(true);
      const errorMsg = err instanceof Error ? err.message : 'Error de red o tiempo de espera agotado';
      return {
        success: false,
        count: processedRows,
        message:
          processedRows > 0
            ? `La carga se interrumpió tras confirmar ${processedRows} de ${totalUniqueRows} registros (${errorMsg}). El padrón muestra únicamente los registros efectivamente guardados en la base.`
            : `No se pudo completar la importación en el servidor (${errorMsg}).`,
      };
    }
  },
}));

