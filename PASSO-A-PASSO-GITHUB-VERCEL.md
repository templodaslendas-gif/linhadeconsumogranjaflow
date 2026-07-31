# Passo a passo — GitHub e Vercel

## 1. Descompactar

Extraia o ZIP no computador. Dentro da pasta devem aparecer diretamente:

- `app`
- `public`
- `package.json`
- `package-lock.json`
- `README.md`

## 2. Criar o repositório no GitHub

1. Acesse `https://github.com/new`.
2. Nome sugerido: `granjaflow-consumo-inteligente`.
3. Escolha repositório público ou privado.
4. Não marque as opções para criar README, `.gitignore` ou licença.
5. Clique em **Create repository**.

## 3. Enviar os arquivos

1. No repositório vazio, clique em **uploading an existing file**.
2. Arraste todo o conteúdo da pasta descompactada.
3. Confirme que `app`, `public` e `package.json` ficaram na raiz.
4. Escreva uma mensagem, por exemplo: `Publica dashboard de consumo`.
5. Clique em **Commit changes**.

## 4. Publicar na Vercel

1. Acesse `https://vercel.com/new`.
2. Entre com a conta conectada ao GitHub.
3. Localize o repositório e clique em **Import**.
4. Em **Framework Preset**, mantenha **Next.js**.
5. Deixe **Root Directory** em branco.
6. Não é necessário cadastrar variáveis de ambiente.
7. Clique em **Deploy**.
8. Ao finalizar, copie o endereço no formato:
   `https://seu-projeto.vercel.app`.

## 5. Criar a opção no GranjaFlow

Use o endereço fornecido pela Vercel no item de menu **Consumo Inteligente**:

```tsx
<a
  href="https://SEU-PROJETO.vercel.app"
  target="_blank"
  rel="noopener noreferrer"
>
  Consumo Inteligente
</a>
```

Assim, o produtor clica no GranjaFlow e abre a dashboard em uma nova aba.

## 6. Atualizações futuras

Quando quiser alterar o visual:

1. atualize os arquivos do repositório no GitHub;
2. faça um novo commit;
3. a Vercel publica a nova versão automaticamente.

Esta versão usa uma curva fixa. Não precisa de banco de dados, Supabase ou
importação manual durante o uso.
