import { useState, type DragEvent, type ChangeEvent } from 'react';
import {
  Badge,
  Box,
  Button,
  HStack,
  Spinner,
  Table,
  Text,
  VStack,
} from '@chakra-ui/react';
import { toaster } from '@/shared/components/toaster.instance';
import { useDonantesStore, type CsvImportProgress } from '../model/donantesStore';

interface CsvPreviewRow {
  tipo: string;
  doc: string;
  nombre: string;
  email: string;
  telefono: string;
}

export const CsvImportCard = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewRows, setPreviewRows] = useState<CsvPreviewRow[]>([]);
  const [totalDetectedRows, setTotalDetectedRows] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<CsvImportProgress | null>(null);

  const importarCSV = useDonantesStore((state) => state.importarCSV);

  const handleDownloadTemplate = () => {
    const csvContent =
      'TipoPersona,TipoDoc,Documento,Nombre/Razón Social,Email,Teléfono\n' +
      'HUMANA,DNI,12345678,Juan Perez,juan.perez@example.com,1122334455\n' +
      'JURIDICA,CUIT,30-71234567-9,Fundacion Ayuda Humana,contacto@fundacionayuda.org,1199887766\n' +
      'HUMANA,DNI,87654321,Maria Gomez,maria.gomez@example.com,1155667788\n' +
      'JURIDICA,CUIT,30-99887766-5,Supermercados del Sur S.A.,donaciones@supersur.com,1144332211\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plantilla_donantes_donatrack.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toaster.create({
      title: 'Plantilla descargada',
      description: 'Se ha descargado el archivo modelo plantilla_donantes_donatrack.csv',
      type: 'info',
    });
  };

  /**
   * Solo lee una muestra liviana para previsualizar las primeras 5 filas en la UI.
   * Toda la verificación de emails duplicados, altas y actualizaciones se delega al Backend.
   */
  const parsePreview = (uploadedFile: File) => {
    if (uploadedFile.name.toLowerCase().endsWith('.xlsx')) {
      setTotalDetectedRows(0);
      setPreviewRows([]);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawText = (e.target?.result as string) || '';
      const text = rawText.replace(/^\uFEFF/, '');
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const dataLines = lines[0]?.toLowerCase().includes('tipopersona')
        ? lines.slice(1)
        : lines;

      const rows: CsvPreviewRow[] = [];
      for (const line of dataLines.slice(0, 5)) {
        const cols = line.split(',').map((c) => c.trim());
        if (cols.length >= 4) {
          rows.push({
            tipo: cols[0] || 'HUMANA',
            doc: `${cols[1] || 'DOC'}: ${cols[2] || ''}`,
            nombre: cols[3] || 'Sin Nombre',
            email: cols[4] || 'Sin Email',
            telefono: cols[5] || 'Sin Teléfono',
          });
        }
      }

      setTotalDetectedRows(dataLines.length);
      setPreviewRows(rows);
    };
    reader.readAsText(uploadedFile);
  };

  const handleFileSelected = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.xlsx')) {
      toaster.create({
        title: 'Formato inválido',
        description: 'Por favor selecciona un archivo con extensión .csv o .xlsx',
        type: 'error',
      });
      return;
    }

    setFile(selectedFile);
    parsePreview(selectedFile);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(null);
    try {
      const result = await importarCSV(file, (prog) => setProgress(prog));
      toaster.create({
        title: result.success ? 'Importación completada' : 'Importación incompleta o con errores',
        description: result.message,
        type: result.success ? 'success' : 'error',
      });
      if (result.success) {
        setFile(null);
        setPreviewRows([]);
        setTotalDetectedRows(0);
      }
    } catch {
      toaster.create({
        title: 'Error de importación',
        description: 'Ocurrió un error al procesar el archivo de donantes.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  return (
    <VStack gap="6" align="stretch" width="100%">
      {/* Botón superior de descarga de plantilla */}
      <HStack justify="space-between" wrap="wrap" gap="3">
        <VStack align="start" gap="0.5">
          <Text fontSize="md" fontWeight="bold" color="gray.800">
            Importación Masiva de Donantes
          </Text>
          <Text fontSize="xs" color="gray.500">
            Carga múltiples personas físicas y jurídicas a partir de una planilla CSV o Excel.
          </Text>
        </VStack>

        <Button
          variant="outline"
          borderRadius="full"
          size="sm"
          onClick={handleDownloadTemplate}
          colorPalette="teal"
          _hover={{ bg: 'teal.50' }}
        >
          📥 Descargar Plantilla Modelo (.csv)
        </Button>
      </HStack>

      {/* Zona Drag & Drop */}
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        p="8"
        borderWidth="2px"
        borderStyle="dashed"
        borderColor={isDragging ? 'teal.500' : 'gray.300'}
        borderRadius="3xl"
        bg={isDragging ? 'teal.50/50' : 'gray.50'}
        textAlign="center"
        transition="all 0.25s ease"
        cursor="pointer"
        onClick={() => document.getElementById('csv-file-input')?.click()}
        _hover={{ borderColor: 'teal.400', bg: 'white', shadow: 'sm' }}
      >
        <input
          id="csv-file-input"
          type="file"
          accept=".csv,.xlsx"
          style={{ display: 'none' }}
          onChange={handleInputChange}
        />

        <VStack gap="3">
          <Text fontSize="4xl">📁</Text>
          <VStack gap="1">
            <Text fontSize="base" fontWeight="bold" color="gray.800">
              {file ? file.name : 'Arrastra y suelta tu archivo aquí'}
            </Text>
            <Text fontSize="xs" color="gray.500">
              O haz clic para explorar en tu equipo (formatos soportados: .csv, .xlsx)
            </Text>
          </VStack>

          {file && (
            <Badge
              colorPalette="teal"
              variant="subtle"
              px="4"
              py="1.5"
              borderRadius="full"
              fontSize="xs"
              fontWeight="bold"
            >
              ✓ Archivo listo: {(file.size / 1024).toFixed(1)} KB
            </Badge>
          )}
        </VStack>
      </Box>

      {/* Tabla de Preview si se cargó un archivo */}
      {previewRows.length > 0 && (
        <Box
          p="5"
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="2xl"
          bg="white"
          shadow="xs"
        >
          <HStack justify="space-between" mb="3" wrap="wrap" gap="2">
            <Text fontSize="sm" fontWeight="bold" color="gray.800">
              Vista previa de los primeros registros detectados:
            </Text>
            <HStack gap="2">
              {totalDetectedRows > 0 && (
                <Badge colorPalette="teal" variant="subtle" borderRadius="full" px="3" py="0.5">
                  {totalDetectedRows} filas totales en archivo
                </Badge>
              )}
              <Badge colorPalette="gray" variant="outline" borderRadius="full" px="2.5" py="0.5">
                {previewRows.length} filas previsualizadas
              </Badge>
            </HStack>
          </HStack>

          <Box overflowX="auto">
            <Table.Root size="sm" variant="outline" borderRadius="xl">
              <Table.Header bg="gray.50">
                <Table.Row>
                  <Table.ColumnHeader>Tipo</Table.ColumnHeader>
                  <Table.ColumnHeader>Nombre / Razón Social</Table.ColumnHeader>
                  <Table.ColumnHeader>Documento</Table.ColumnHeader>
                  <Table.ColumnHeader>Correo</Table.ColumnHeader>
                  <Table.ColumnHeader>Teléfono</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {previewRows.map((r, i) => (
                  <Table.Row key={i}>
                    <Table.Cell>
                      <Badge
                        colorPalette={r.tipo === 'HUMANA' ? 'teal' : 'purple'}
                        variant="subtle"
                        size="xs"
                        borderRadius="full"
                      >
                        {r.tipo}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell fontWeight="semibold">{r.nombre}</Table.Cell>
                    <Table.Cell>{r.doc}</Table.Cell>
                    <Table.Cell>{r.email}</Table.Cell>
                    <Table.Cell>{r.telefono}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Box>
      )}

      {/* Progreso de subida por lotes al Backend */}
      {isProcessing && progress && (
        <Box
          p="4"
          borderRadius="2xl"
          bg="teal.50"
          borderWidth="1px"
          borderColor="teal.200"
        >
          <HStack gap="3" align="center">
            <Spinner size="sm" colorPalette="teal" />
            <VStack align="start" gap="0.5">
              <Text fontSize="sm" fontWeight="bold" color="teal.800">
                {progress.stage}
              </Text>
              <Text fontSize="xs" color="teal.600">
                Lote {progress.currentBatch} de {progress.totalBatches} •{' '}
                {Math.round((progress.processedRows / Math.max(1, progress.totalRows)) * 100)}% completado
              </Text>
            </VStack>
          </HStack>
        </Box>
      )}

      {/* Botón de Ejecutar Importación */}
      {file && (
        <HStack justify="end" pt="2">
          <Button
            variant="outline"
            borderRadius="full"
            onClick={() => {
              setFile(null);
              setPreviewRows([]);
              setTotalDetectedRows(0);
            }}
            disabled={isProcessing}
          >
            Quitar archivo
          </Button>

          <Button
            colorPalette="teal"
            borderRadius="full"
            px="8"
            size="lg"
            shadow="md"
            onClick={handleUpload}
            disabled={isProcessing}
            _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
            transition="all 0.2s ease"
          >
            {isProcessing ? 'Enviando al servidor...' : '🚀 Iniciar Importación de Donantes'}
          </Button>
        </HStack>
      )}
    </VStack>
  );
};
