const secciones = [
  {
    titulo: 'Nuestra historia',
    parrafos: [
      'Contamos con 11 años de experiencia entregando productos musicales y atención personalizada a nuestros clientes.',
      'Nuestra tienda nació con el objetivo de acercar instrumentos y equipos musicales a músicos, estudiantes y aficionados de la Región de Valparaíso.',
    ],
  },
  {
    titulo: 'Qué ofrecemos',
    parrafos: [
      'Disponemos de una amplia variedad de instrumentos, accesorios y equipos musicales para diferentes necesidades.',
      'Nuestro catálogo cuenta con productos de distintas categorías y marcas.',
    ],
  },
  {
    titulo: 'Nuestro compromiso',
    parrafos: ['Buscamos entregar una atención cercana, productos de calidad y una experiencia de compra fácil y confiable.'],
  },
]

const equipo = ['Sebastian Montupil', 'Vicente Martinez', 'Felipe Veliz']

function Nosotros() {
  return (
    <>
      <section className="p-4 p-md-5 bg-white border rounded-3 mb-5">
        <h1>Sobre Sonido Vivo</h1>
        <p className="lead mb-0">
          Sonido Vivo es una tienda dedicada a la venta de instrumentos musicales y equipos de audio, ubicada en Viña del Mar.
        </p>
      </section>

      <div className="row g-4 mb-5">
        {secciones.map((seccion) => (
          <section className="col-12 col-md-4" key={seccion.titulo}>
            <div className="card h-100">
              <div className="card-body">
                <h2 className="h4">{seccion.titulo}</h2>
                {seccion.parrafos.map((parrafo) => <p key={parrafo}>{parrafo}</p>)}
              </div>
            </div>
          </section>
        ))}
      </div>

      <section aria-labelledby="titulo-equipo">
        <h2 id="titulo-equipo" className="h4">Equipo desarrollador</h2>
        <ul className="list-group list-group-flush">
          {equipo.map((integrante) => <li className="list-group-item bg-transparent" key={integrante}>{integrante}</li>)}
        </ul>
      </section>
    </>
  )
}

export default Nosotros
