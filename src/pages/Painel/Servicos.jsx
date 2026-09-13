import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  listarTodosServicos,
  criarServico,
  atualizarServico,
  excluirServico,
} from '../../services/servicos'
import CampoTexto from '../../components/CampoTexto'
import Botao from '../../components/Botao'
import styles from './Servicos.module.css'

const SERVICO_VAZIO = { nome: '', duracaoMin: '', preco: '' }

function formatarPreco(preco) {
  return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function Servicos() {
  const { negocio } = useOutletContext()
  const [servicos, setServicos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [editando, setEditando] = useState(null) // null | 'novo' | servicoId
  const [form, setForm] = useState(SERVICO_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)

  async function recarregar() {
    setCarregando(true)
    setServicos(await listarTodosServicos(negocio.id))
    setCarregando(false)
  }

  useEffect(() => {
    recarregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [negocio.id])

  function abrirNovo() {
    setForm(SERVICO_VAZIO)
    setErro(null)
    setEditando('novo')
  }

  function abrirEdicao(servico) {
    setForm({ nome: servico.nome, duracaoMin: String(servico.duracaoMin), preco: String(servico.preco) })
    setErro(null)
    setEditando(servico.id)
  }

  function fechar() {
    setEditando(null)
  }

  const formValido =
    form.nome.trim().length >= 2 && Number(form.duracaoMin) > 0 && Number(form.preco) >= 0

  async function salvar(e) {
    e.preventDefault()
    if (!formValido) return
    setSalvando(true)
    setErro(null)
    const dados = {
      nome: form.nome.trim(),
      duracaoMin: Number(form.duracaoMin),
      preco: Number(form.preco),
      ativo: true,
    }
    try {
      if (editando === 'novo') {
        await criarServico(negocio.id, dados)
      } else {
        await atualizarServico(negocio.id, editando, dados)
      }
      await recarregar()
      fechar()
    } catch {
      setErro('Não foi possível salvar. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  async function alternarAtivo(servico) {
    await atualizarServico(negocio.id, servico.id, { ativo: !servico.ativo })
    recarregar()
  }

  async function excluir(servico) {
    if (!confirm(`Excluir "${servico.nome}"? Isso não afeta agendamentos já feitos.`)) return
    await excluirServico(negocio.id, servico.id)
    recarregar()
  }

  return (
    <div>
      {editando ? (
        <form onSubmit={salvar} className={styles.formulario} noValidate>
          <CampoTexto
            label="Nome do serviço"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            autoFocus
          />
          <CampoTexto
            label="Duração (minutos)"
            type="number"
            min="5"
            step="5"
            value={form.duracaoMin}
            onChange={(e) => setForm({ ...form, duracaoMin: e.target.value })}
          />
          <CampoTexto
            label="Preço (R$)"
            type="number"
            min="0"
            step="0.01"
            value={form.preco}
            onChange={(e) => setForm({ ...form, preco: e.target.value })}
          />
          {erro && (
            <p role="alert" style={{ color: 'var(--cor-erro)', fontSize: 14, marginBottom: 'var(--espaco-4)' }}>
              {erro}
            </p>
          )}
          <div className={styles.acoesForm}>
            <Botao type="button" variante="secundario" onClick={fechar}>
              Cancelar
            </Botao>
            <Botao type="submit" disabled={!formValido || salvando}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </Botao>
          </div>
        </form>
      ) : (
        <Botao onClick={abrirNovo} className={styles.botaoNovo}>
          + Novo serviço
        </Botao>
      )}

      {carregando && <p className={styles.mensagem}>Carregando…</p>}

      {!carregando && servicos.length === 0 && !editando && (
        <p className={styles.mensagem}>Nenhum serviço cadastrado ainda.</p>
      )}

      <ul className={styles.lista}>
        {servicos.map((servico) => (
          <li key={servico.id} className={`${styles.item} ${!servico.ativo ? styles.itemInativo : ''}`}>
            <div>
              <p className={styles.nomeServico}>{servico.nome}</p>
              <p className={styles.detalheServico}>
                {servico.duracaoMin} min · {formatarPreco(servico.preco)}
                {!servico.ativo && ' · inativo'}
              </p>
            </div>
            <div className={styles.acoesItem}>
              <button type="button" className={styles.linkAcao} onClick={() => abrirEdicao(servico)}>
                Editar
              </button>
              <button type="button" className={styles.linkAcao} onClick={() => alternarAtivo(servico)}>
                {servico.ativo ? 'Desativar' : 'Ativar'}
              </button>
              <button type="button" className={styles.linkAcaoPerigo} onClick={() => excluir(servico)}>
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
