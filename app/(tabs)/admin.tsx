import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Alert,
  RefreshControl,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import {
  esAdmin,
  getSuscripcionesPendientes,
  otorgarAcceso,
  rechazarAcceso,
} from '../../lib/services/adminService';
import { SuscripcionPendiente } from '../../lib/services/adminService';
import {
  obtenerTodosLosCursos,
  crearCurso,
  actualizarCurso,
  eliminarCurso,
  obtenerLeccionesPorCurso,
  crearLeccion,
  actualizarLeccion,
  eliminarLeccion,
} from '../../lib/services/cursoAdminService';
import { seleccionarPdf, subirPdf } from '../../lib/services/storageService';
import { Curso, Leccion } from '../../types/database';

type Tab = 'solicitudes' | 'cursos' | 'lecciones';

export default function AdminScreen() {
  const [esAdminUsuario, setEsAdminUsuario] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [tabActiva, setTabActiva] = useState<Tab>('solicitudes');
  
  // Estado para solicitudes
  const [suscripciones, setSuscripciones] = useState<SuscripcionPendiente[]>([]);
  const [cargandoSuscripciones, setCargandoSuscripciones] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Estado para cursos
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cargandoCursos, setCargandoCursos] = useState(false);
  const [modalCurso, setModalCurso] = useState(false);
  const [cursoEditando, setCursoEditando] = useState<Curso | null>(null);
  const [tituloCurso, setTituloCurso] = useState('');
  const [descripcionCurso, setDescripcionCurso] = useState('');
  const [urlPortada, setUrlPortada] = useState('');

  // Estado para lecciones
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [cargandoLecciones, setCargandoLecciones] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string | null>(null);
  const [modalLeccion, setModalLeccion] = useState(false);
  const [leccionEditando, setLeccionEditando] = useState<Leccion | null>(null);
  const [tituloLeccion, setTituloLeccion] = useState('');
  const [urlContenido, setUrlContenido] = useState('');
  const [tipoContenido, setTipoContenido] = useState<'VIDEO' | 'PDF'>('PDF');
  const [ordenLeccion, setOrdenLeccion] = useState('');
  const [subiendoPdf, setSubiendoPdf] = useState(false);

  useEffect(() => {
    verificarAdmin();
  }, []);

  useEffect(() => {
    if (esAdminUsuario) {
      if (tabActiva === 'solicitudes') {
        cargarSuscripciones();
      } else if (tabActiva === 'cursos') {
        cargarCursos();
      } else if (tabActiva === 'lecciones' && cursoSeleccionado) {
        cargarLecciones();
      }
    }
  }, [tabActiva, cursoSeleccionado, esAdminUsuario]);

  const verificarAdmin = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setEsAdminUsuario(false);
        setVerificando(false);
        return;
      }

      const admin = await esAdmin(user.id);
      setEsAdminUsuario(admin);
    } catch (error) {
      console.error('Error verificando admin:', error);
    } finally {
      setVerificando(false);
    }
  };

  const cargarSuscripciones = async () => {
    try {
      setCargandoSuscripciones(true);
      const datos = await getSuscripcionesPendientes();
      setSuscripciones(datos);
    } catch (error) {
      console.error('Error cargando suscripciones:', error);
      Alert.alert('Error', 'No se pudieron cargar las solicitudes');
    } finally {
      setCargandoSuscripciones(false);
      setRefreshing(false);
    }
  };

  const cargarCursos = async () => {
    try {
      const datos = await obtenerTodosLosCursos();
      setCursos(datos);
    } catch (error) {
      console.error('Error cargando cursos:', error);
      Alert.alert('Error', 'No se pudieron cargar los cursos');
    }
  };

  const cargarLecciones = async () => {
    if (!cursoSeleccionado) return;
    try {
      setCargandoLecciones(true);
      const datos = await obtenerLeccionesPorCurso(cursoSeleccionado);
      setLecciones(datos);
    } catch (error) {
      console.error('Error cargando lecciones:', error);
      Alert.alert('Error', 'No se pudieron cargar las lecciones');
    } finally {
      setCargandoLecciones(false);
    }
  };

  const handleToggleAcceso = async (suscripcion: SuscripcionPendiente, otorgar: boolean) => {
    try {
      if (otorgar) {
        await otorgarAcceso(suscripcion.id);
        Alert.alert('Éxito', 'Acceso otorgado correctamente');
      } else {
        Alert.alert(
          'Rechazar solicitud',
          '¿Estás seguro de que deseas rechazar esta solicitud?',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Rechazar',
              style: 'destructive',
              onPress: async () => {
                await rechazarAcceso(suscripcion.id);
                Alert.alert('Éxito', 'Solicitud rechazada');
                cargarSuscripciones();
              },
            },
          ]
        );
        return;
      }
      cargarSuscripciones();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el acceso');
    }
  };

  const abrirModalCurso = (curso?: Curso) => {
    if (curso) {
      setCursoEditando(curso);
      setTituloCurso(curso.titulo);
      setDescripcionCurso(curso.descripcion || '');
      setUrlPortada(curso.url_portada || '');
    } else {
      setCursoEditando(null);
      setTituloCurso('');
      setDescripcionCurso('');
      setUrlPortada('');
    }
    setModalCurso(true);
  };

  const guardarCurso = async () => {
    if (!tituloCurso.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }

    try {
      if (cursoEditando) {
        await actualizarCurso(cursoEditando.id, tituloCurso, descripcionCurso, urlPortada);
        Alert.alert('Éxito', 'Curso actualizado correctamente');
      } else {
        await crearCurso(tituloCurso, descripcionCurso, urlPortada);
        Alert.alert('Éxito', 'Curso creado correctamente');
      }
      setModalCurso(false);
      cargarCursos();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el curso');
    }
  };

  const eliminarCursoConfirmado = async (cursoId: string) => {
    Alert.alert(
      'Eliminar curso',
      '¿Estás seguro? Esto eliminará todas las lecciones asociadas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarCurso(cursoId);
              Alert.alert('Éxito', 'Curso eliminado');
              cargarCursos();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el curso');
            }
          },
        },
      ]
    );
  };

  const abrirModalLeccion = (leccion?: Leccion) => {
    if (leccion) {
      setLeccionEditando(leccion);
      setTituloLeccion(leccion.titulo_leccion);
      setUrlContenido(leccion.url_contenido);
      setTipoContenido(leccion.tipo_contenido);
      setOrdenLeccion(leccion.orden.toString());
    } else {
      setLeccionEditando(null);
      setTituloLeccion('');
      setUrlContenido('');
      setTipoContenido('PDF');
      const nuevoOrden = (lecciones.length + 1).toString();
      setOrdenLeccion(nuevoOrden);
    }
    setModalLeccion(true);
  };

  const seleccionarYSubirPdf = async () => {
    try {
      setSubiendoPdf(true);
      const archivo = await seleccionarPdf();
      if (!archivo) {
        setSubiendoPdf(false);
        return;
      }

      if (!cursoSeleccionado) {
        Alert.alert('Error', 'Primero selecciona un curso');
        setSubiendoPdf(false);
        return;
      }

      Alert.alert('Subiendo PDF...', 'Por favor espera');
      const url = await subirPdf(archivo.uri, archivo.name, cursoSeleccionado);
      setUrlContenido(url);
      setTipoContenido('PDF');
      Alert.alert('Éxito', 'PDF subido correctamente');
    } catch (error) {
      console.error('Error subiendo PDF:', error);
      Alert.alert('Error', 'No se pudo subir el PDF');
    } finally {
      setSubiendoPdf(false);
    }
  };

  const guardarLeccion = async () => {
    if (!cursoSeleccionado) {
      Alert.alert('Error', 'Selecciona un curso primero');
      return;
    }
    if (!tituloLeccion.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }
    if (!urlContenido.trim()) {
      Alert.alert('Error', 'La URL del contenido es obligatoria');
      return;
    }
    if (!ordenLeccion.trim()) {
      Alert.alert('Error', 'El orden es obligatorio');
      return;
    }

    try {
      const orden = parseInt(ordenLeccion);
      if (leccionEditando) {
        await actualizarLeccion(
          leccionEditando.id,
          tituloLeccion,
          urlContenido,
          tipoContenido,
          orden
        );
        Alert.alert('Éxito', 'Lección actualizada correctamente');
      } else {
        await crearLeccion(cursoSeleccionado, tituloLeccion, urlContenido, tipoContenido, orden);
        Alert.alert('Éxito', 'Lección creada correctamente');
      }
      setModalLeccion(false);
      cargarLecciones();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la lección');
    }
  };

  const eliminarLeccionConfirmada = async (leccionId: string) => {
    Alert.alert(
      'Eliminar lección',
      '¿Estás seguro de eliminar esta lección?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarLeccion(leccionId);
              Alert.alert('Éxito', 'Lección eliminada');
              cargarLecciones();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la lección');
            }
          },
        },
      ]
    );
  };

  if (verificando) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  if (!esAdminUsuario) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No tienes permisos de administrador</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, tabActiva === 'solicitudes' && styles.tabActiva]}
          onPress={() => setTabActiva('solicitudes')}
        >
          <Text style={[styles.tabText, tabActiva === 'solicitudes' && styles.tabTextActiva]}>
            Solicitudes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tabActiva === 'cursos' && styles.tabActiva]}
          onPress={() => setTabActiva('cursos')}
        >
          <Text style={[styles.tabText, tabActiva === 'cursos' && styles.tabTextActiva]}>
            Cursos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tabActiva === 'lecciones' && styles.tabActiva]}
          onPress={() => setTabActiva('lecciones')}
        >
          <Text style={[styles.tabText, tabActiva === 'lecciones' && styles.tabTextActiva]}>
            Lecciones
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido de tabs */}
      <ScrollView style={styles.content}>
        {tabActiva === 'solicitudes' && (
          <View>
            <Text style={styles.titulo}>
              {suscripciones.length} solicitud(es) pendiente(s)
            </Text>
            <FlatList
              data={suscripciones}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.suscripcionItem}>
                  <View style={styles.suscripcionInfo}>
                    <Text style={styles.cursoNombre}>
                      {item.curso?.titulo || 'Curso sin título'}
                    </Text>
                    <Text style={styles.usuarioId}>Usuario: {item.user_id}</Text>
                  </View>
                  <View style={styles.accionesContainer}>
                    <View style={styles.switchContainer}>
                      <Text style={styles.switchLabel}>
                        {item.acceso_otorgado ? 'Acceso otorgado' : 'Pendiente'}
                      </Text>
                      <Switch
                        value={item.acceso_otorgado}
                        onValueChange={(value) => handleToggleAcceso(item, value)}
                        trackColor={{ false: '#767577', true: '#4285F4' }}
                        thumbColor={item.acceso_otorgado ? '#fff' : '#f4f3f4'}
                      />
                    </View>
                  </View>
                </View>
              )}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={cargarSuscripciones} />
              }
              ListEmptyComponent={
                <Text style={styles.emptyText}>No hay solicitudes pendientes</Text>
              }
            />
          </View>
        )}

        {tabActiva === 'cursos' && (
          <View>
            <TouchableOpacity style={styles.botonAgregar} onPress={() => abrirModalCurso()}>
              <Text style={styles.botonAgregarText}>+ Crear Curso</Text>
            </TouchableOpacity>
            {cargandoCursos ? (
              <ActivityIndicator size="large" color="#4285F4" />
            ) : (
              <FlatList
                data={cursos}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.cursoItem}>
                    <View style={styles.cursoInfo}>
                      <Text style={styles.cursoNombre}>{item.titulo}</Text>
                      {item.descripcion && (
                        <Text style={styles.cursoDescripcion} numberOfLines={2}>
                          {item.descripcion}
                        </Text>
                      )}
                    </View>
                    <View style={styles.cursoAcciones}>
                      <TouchableOpacity
                        style={styles.botonEditar}
                        onPress={() => abrirModalCurso(item)}
                      >
                        <Text style={styles.botonEditarText}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.botonEliminar}
                        onPress={() => eliminarCursoConfirmado(item.id)}
                      >
                        <Text style={styles.botonEliminarText}>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No hay cursos creados</Text>
                }
              />
            )}
          </View>
        )}

        {tabActiva === 'lecciones' && (
          <View>
            <Text style={styles.titulo}>Selecciona un curso</Text>
            <FlatList
              data={cursos}
              keyExtractor={(item) => item.id}
              horizontal
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.cursoSelector,
                    cursoSeleccionado === item.id && styles.cursoSelectorActivo,
                  ]}
                  onPress={() => {
                    setCursoSeleccionado(item.id);
                    cargarLecciones();
                  }}
                >
                  <Text
                    style={[
                      styles.cursoSelectorText,
                      cursoSeleccionado === item.id && styles.cursoSelectorTextActivo,
                    ]}
                  >
                    {item.titulo}
                  </Text>
                </TouchableOpacity>
              )}
            />
            {cursoSeleccionado && (
              <>
                <TouchableOpacity
                  style={styles.botonAgregar}
                  onPress={() => abrirModalLeccion()}
                >
                  <Text style={styles.botonAgregarText}>+ Crear Lección</Text>
                </TouchableOpacity>
                {cargandoLecciones ? (
                  <ActivityIndicator size="large" color="#4285F4" />
                ) : (
                  <FlatList
                    data={lecciones}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.leccionItem}>
                        <View style={styles.leccionInfo}>
                          <Text style={styles.leccionTitulo}>{item.titulo_leccion}</Text>
                          <Text style={styles.leccionTipo}>
                            Tipo: {item.tipo_contenido} | Orden: {item.orden}
                          </Text>
                        </View>
                        <View style={styles.leccionAcciones}>
                          <TouchableOpacity
                            style={styles.botonEditar}
                            onPress={() => abrirModalLeccion(item)}
                          >
                            <Text style={styles.botonEditarText}>Editar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.botonEliminar}
                            onPress={() => eliminarLeccionConfirmada(item.id)}
                          >
                            <Text style={styles.botonEliminarText}>Eliminar</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                    ListEmptyComponent={
                      <Text style={styles.emptyText}>No hay lecciones en este curso</Text>
                    }
                  />
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal Curso */}
      <Modal visible={modalCurso} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>
              {cursoEditando ? 'Editar Curso' : 'Nuevo Curso'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Título"
              placeholderTextColor="#999"
              value={tituloCurso}
              onChangeText={setTituloCurso}
            />
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Descripción"
              placeholderTextColor="#999"
              value={descripcionCurso}
              onChangeText={setDescripcionCurso}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="URL de portada (opcional)"
              placeholderTextColor="#999"
              value={urlPortada}
              onChangeText={setUrlPortada}
            />
            <View style={styles.modalAcciones}>
              <TouchableOpacity style={styles.botonCancelar} onPress={() => setModalCurso(false)}>
                <Text style={styles.botonCancelarText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonGuardar} onPress={guardarCurso}>
                <Text style={styles.botonGuardarText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Lección */}
      <Modal visible={modalLeccion} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitulo}>
              {leccionEditando ? 'Editar Lección' : 'Nueva Lección'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Título de la lección"
              placeholderTextColor="#999"
              value={tituloLeccion}
              onChangeText={setTituloLeccion}
            />
            <View style={styles.tipoContenidoContainer}>
              <TouchableOpacity
                style={[
                  styles.tipoBoton,
                  tipoContenido === 'PDF' && styles.tipoBotonActivo,
                ]}
                onPress={() => setTipoContenido('PDF')}
              >
                <Text
                  style={[
                    styles.tipoBotonText,
                    tipoContenido === 'PDF' && styles.tipoBotonTextActivo,
                  ]}
                >
                  PDF
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tipoBoton,
                  tipoContenido === 'VIDEO' && styles.tipoBotonActivo,
                ]}
                onPress={() => setTipoContenido('VIDEO')}
              >
                <Text
                  style={[
                    styles.tipoBotonText,
                    tipoContenido === 'VIDEO' && styles.tipoBotonTextActivo,
                  ]}
                >
                  VIDEO
                </Text>
              </TouchableOpacity>
            </View>
            {tipoContenido === 'PDF' && (
              <TouchableOpacity
                style={styles.botonSubirPdf}
                onPress={seleccionarYSubirPdf}
                disabled={subiendoPdf}
              >
                <Text style={styles.botonSubirPdfText}>
                  {subiendoPdf ? 'Subiendo...' : '📄 Subir PDF'}
                </Text>
              </TouchableOpacity>
            )}
            <TextInput
              style={styles.input}
              placeholder={tipoContenido === 'PDF' ? 'URL del PDF' : 'URL de YouTube'}
              placeholderTextColor="#999"
              value={urlContenido}
              onChangeText={setUrlContenido}
            />
            <TextInput
              style={styles.input}
              placeholder="Orden"
              placeholderTextColor="#999"
              value={ordenLeccion}
              onChangeText={setOrdenLeccion}
              keyboardType="numeric"
            />
            <View style={styles.modalAcciones}>
              <TouchableOpacity style={styles.botonCancelar} onPress={() => setModalLeccion(false)}>
                <Text style={styles.botonCancelarText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonGuardar} onPress={guardarLeccion}>
                <Text style={styles.botonGuardarText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActiva: {
    borderBottomColor: '#4285F4',
  },
  tabText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActiva: {
    color: '#4285F4',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  suscripcionItem: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  suscripcionInfo: {
    marginBottom: 12,
  },
  cursoItem: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  cursoInfo: {
    marginBottom: 12,
  },
  cursoNombre: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  cursoDescripcion: {
    fontSize: 14,
    color: '#ccc',
  },
  cursoAcciones: {
    flexDirection: 'row',
    gap: 8,
  },
  usuarioId: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  accionesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    color: '#fff',
  },
  botonAgregar: {
    backgroundColor: '#4285F4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  botonAgregarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  botonEditar: {
    backgroundColor: '#34C759',
    padding: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  botonEditarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  botonEliminar: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  botonEliminarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cursoSelector: {
    padding: 12,
    marginRight: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  cursoSelectorActivo: {
    backgroundColor: '#4285F4',
  },
  cursoSelectorText: {
    color: '#999',
    fontSize: 14,
  },
  cursoSelectorTextActivo: {
    color: '#fff',
    fontWeight: '600',
  },
  leccionItem: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  leccionInfo: {
    marginBottom: 12,
  },
  leccionTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  leccionTipo: {
    fontSize: 14,
    color: '#999',
  },
  leccionAcciones: {
    flexDirection: 'row',
    gap: 8,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    padding: 40,
  },
  errorText: {
    color: '#999',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  tipoContenidoContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  tipoBoton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  tipoBotonActivo: {
    backgroundColor: '#4285F4',
  },
  tipoBotonText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  tipoBotonTextActivo: {
    color: '#fff',
  },
  botonSubirPdf: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  botonSubirPdfText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalAcciones: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  botonCancelar: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#333',
    alignItems: 'center',
  },
  botonCancelarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  botonGuardar: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#4285F4',
    alignItems: 'center',
  },
  botonGuardarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
