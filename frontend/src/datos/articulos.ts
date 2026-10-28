import type { Articulo } from '../tipos/Articulo'

export const articulos: Articulo[] = [
  {
    id: 'como-elegir-tu-primera-guitarra',
    titulo: 'Cómo elegir tu primera guitarra',
    resumen: 'Elegir una guitarra por primera vez puede ser difícil. Te contamos los aspectos importantes que debes considerar antes de comprar tu primer instrumento.',
    introduccion: 'Comprar tu primera guitarra es una decisión importante, especialmente si estás comenzando a aprender a tocar. Existen distintos tipos de guitarras y cada una tiene características diferentes.',
    imagen: '/img/productos/yamaha-c40-GA003.jpg',
    descripcionImagen: 'Guitarra clásica Yamaha C40',
    secciones: [
      {
        titulo: 'Define qué tipo de guitarra necesitas',
        texto: 'Antes de comprar una guitarra debes considerar el estilo de música que quieres tocar. Las guitarras acústicas, clásicas y eléctricas ofrecen experiencias diferentes.',
      },
      {
        titulo: 'Considera tu presupuesto',
        texto: 'No es necesario comprar el instrumento más costoso para comenzar. Existen guitarras para principiantes que ofrecen una buena relación entre calidad y precio.',
      },
      {
        titulo: 'Comodidad del instrumento',
        texto: 'Es importante que la guitarra sea cómoda para ti. El tamaño del cuerpo, el peso y el ancho del mástil pueden influir en la facilidad con la que aprendas.',
      },
      {
        titulo: 'Revisa la calidad',
        texto: 'Antes de comprar, revisa el estado general del instrumento, sus cuerdas, clavijas y terminaciones. Una guitarra bien ajustada facilita mucho el aprendizaje.',
      },
      {
        titulo: 'Busca asesoría',
        texto: 'Si tienes dudas, puedes pedir orientación antes de realizar tu compra. Una buena recomendación puede ayudarte a elegir un instrumento adecuado para comenzar.',
      },
    ],
  },
  {
    id: 'cuidado-de-instrumentos',
    titulo: 'Consejos para cuidar tus instrumentos musicales',
    resumen: 'Mantener tus instrumentos en buenas condiciones prolonga su vida útil y conserva una buena calidad de sonido. Conoce algunos consejos para su cuidado y mantenimiento.',
    introduccion: 'Mantener tus instrumentos musicales en buenas condiciones ayuda a prolongar su vida útil y a conservar una buena calidad de sonido.',
    imagen: '/img/productos/hercules-gs302b-AC009.jpg',
    descripcionImagen: 'Soporte de piso para apoyar una guitarra de forma estable',
    secciones: [
      {
        titulo: 'Limpia tu instrumento regularmente',
        texto: 'Después de usar tu instrumento es recomendable limpiarlo para eliminar el polvo, la suciedad y la humedad acumulada durante su uso.',
      },
      {
        titulo: 'Guárdalo correctamente',
        texto: 'Usa una funda o un estuche adecuado para proteger tu instrumento de golpes, polvo y cambios de temperatura.',
      },
      {
        titulo: 'Evita la humedad',
        texto: 'La humedad puede afectar materiales como la madera y algunas piezas metálicas. Guarda tus instrumentos en lugares secos y protegidos.',
      },
      {
        titulo: 'Revisa las piezas periódicamente',
        texto: 'Revisa cuerdas, clavijas, cables, conectores y otras piezas para detectar desgastes antes de que se conviertan en un problema mayor.',
      },
      {
        titulo: 'Realiza mantenimiento cuando sea necesario',
        texto: 'Si notas cambios en el sonido o problemas de funcionamiento, es recomendable realizar una revisión o mantenimiento del instrumento.',
      },
    ],
  },
]

export function buscarArticulo(id: string) {
  return articulos.find((articulo) => articulo.id === id)
}
