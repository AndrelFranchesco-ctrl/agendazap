import styles from './Botao.module.css'

export default function Botao({ variante = 'primario', className = '', ...props }) {
  return <button className={`${styles.botao} ${styles[variante]} ${className}`} {...props} />
}
