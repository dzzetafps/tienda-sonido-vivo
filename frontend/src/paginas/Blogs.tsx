import TarjetaArticulo from '../componentes/moleculas/TarjetaArticulo'
import { articulos } from '../datos/articulos'

function Blogs() {
  return (
    <>
      <section className="mb-5">
        <h1>Blog Sonido Vivo</h1>
        <p className="lead">Consejos, recomendaciones y novedades sobre instrumentos musicales y equipos de audio.</p>
      </section>
      <section aria-labelledby="titulo-publicaciones">
        <h2 id="titulo-publicaciones" className="h4 mb-4">Últimas publicaciones</h2>
        <div className="row g-4">
          {articulos.map((articulo) => (
            <div className="col-12 col-md-6 col-lg-4" key={articulo.id}>
              <TarjetaArticulo articulo={articulo} />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default Blogs
