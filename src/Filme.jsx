// src/Filme.jsx
import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";

const BASE_URL = "http://18.228.117.159:8080";

export default function FilmeApp() {
  const [filmes, setFilmes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState("");

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [nota, setNota] = useState(0);
  const [diretor, setDiretor] = useState("");

  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  // pega o access token quando logado
  useEffect(() => {
  const fetchToken = async () => {
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://pf-filmes-api", 
          scope: "openid profile email"
        },
      });
      setToken(accessToken);
    } catch (e) {
      console.error("Erro ao buscar token:", e);
    }
  };

  if (isAuthenticated) {
    fetchToken();
  }
}, [isAuthenticated, getAccessTokenSilently]);


  if (!isAuthenticated) {
    return <LoginButton />;
  }

  // LISTAR
  async function fetchFilmes() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/filmes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Erro ao carregar: ${res.status}`);
      const data = await res.json();
      setFilmes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // CRIAR
  async function handleCreate(e) {
    e.preventDefault();
    setError(null);

    const dto = {
      nome: nome || null,
      descricao: descricao || null,
      nota: Number(nota),
      diretor: diretor || null,
    };

    try {
      const res = await fetch(`${BASE_URL}/filmes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dto),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro ao criar: ${res.status} ${text}`);
      }

      const created = await res.json();
      setFilmes((prev) => [created, ...prev]);

      setNome("");
      setDescricao("");
      setNota(0);
      setDiretor("");
    } catch (err) {
      setError(err.message);
    }
  }

  // EXCLUIR (apenas admin no backend)
  async function handleDelete(id) {
    try {
      const res = await fetch(`${BASE_URL}/filmes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 204) {
        setFilmes((prev) => prev.filter((f) => f.id !== id));
        return;
      }
      if (res.status === 403) {
        alert("Apenas administradores podem excluir filmes.");
        return;
      }
      const text = await res.text();
      throw new Error(`Falha ao excluir: ${res.status} ${text}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 font-sans">
      <div>
        <img src={user.picture} alt={user.name} style={{ width: 48, borderRadius: 8 }} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <LogoutButton />
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Filmes — cadastro e listagem</h1>

        {/* Formulário */}
        <form onSubmit={handleCreate} className="space-y-3 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do filme"
              className="p-2 border rounded"
              required
            />
            <input
              value={diretor}
              onChange={(e) => setDiretor(e.target.value)}
              placeholder="Diretor"
              className="p-2 border rounded"
              required
            />
          </div>

          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição"
            className="w-full p-2 border rounded"
            rows={3}
            required
          />

          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              min={0}
              max={5}
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Nota (0 a 5)"
              className="p-2 border rounded"
              required
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              Cadastrar
            </button>
            <button type="button" onClick={fetchFilmes} className="px-4 py-2 bg-gray-200 rounded">
              Recarregar
            </button>
          </div>
        </form>

        {error && <div className="mb-4 text-red-600">{error}</div>}

        {/* Tabela */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Filmes cadastrados</h2>

          {loading ? (
            <div>Carregando...</div>
          ) : filmes.length === 0 ? (
            <div>Nenhum filme cadastrado.</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border">Nome</th>
                  <th className="p-2 border">Descrição</th>
                  <th className="p-2 border">Nota</th>
                  <th className="p-2 border">Diretor</th>
                  <th className="p-2 border">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filmes.map((f) => (
                  <tr key={f.id} className="align-top">
                    <td className="p-2 border">{f.nome}</td>
                    <td className="p-2 border">{f.descricao}</td>
                    <td className="p-2 border">{f.nota}</td>
                    <td className="p-2 border">{f.diretor}</td>
                    <td className="p-2 border">
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded"
                        onClick={() => handleDelete(f.id)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
