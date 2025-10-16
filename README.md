# 💪 Gerador de Treino com IA

Aplicação web para gerar treinos personalizados usando Inteligência Artificial.

## 📁 Estrutura do Projeto

```
n8n-test-front/
├── css/
│   ├── main.css      # Estilos da página principal
│   └── treino.css    # Estilos da página de visualização
├── js/
│   ├── main.js       # JavaScript da página principal
│   └── treino.js     # JavaScript da página de visualização
├── index.html        # Página principal (gerador)
├── treino.html       # Página de visualização de treino
└── README.md         # Documentação
```

## 🚀 Funcionalidades

### Página Principal (index.html)
- **Autenticação**: Sistema de login com Clerk
- **Formulário**: Coleta dados do usuário (idade, peso, objetivo, etc.)
- **Geração de Treino**: Integração com API para gerar treino personalizado
- **Histórico**: Visualização de treinos anteriores
- **Compartilhamento**: Links para compartilhar treinos

### Página de Visualização (treino.html)
- **Visualização Completa**: Exibe treino detalhado
- **Responsivo**: Adaptado para mobile e desktop
- **Compartilhamento**: Botões para compartilhar via WhatsApp
- **Impressão Amigável**: Layout otimizado

## 🎨 Melhorias Implementadas

### Organização
- ✅ Separação completa de HTML, CSS e JavaScript
- ✅ Estrutura de pastas organizada
- ✅ Código modularizado e reutilizável

### CSS
- ✅ Estilos organizados por seções
- ✅ Variáveis CSS para cores consistentes
- ✅ Design responsivo otimizado
- ✅ Animações suaves e transições

### JavaScript
- ✅ Funções organizadas por funcionalidade
- ✅ Tratamento de erros melhorado
- ✅ Código mais limpo e legível
- ✅ Comentários explicativos

### UX/UI
- ✅ Interface mais intuitiva
- ✅ Feedback visual melhorado
- ✅ Loading states otimizados
- ✅ Mensagens de erro claras

## ⚙️ Configuração

### 1. Clerk (Autenticação)
Substitua a Publishable Key no `index.html`:
```html
data-clerk-publishable-key="SUA_PUBLISHABLE_KEY_AQUI"
```

### 2. APIs
Configure as URLs nos arquivos JavaScript:

**main.js:**
```javascript
const WEBHOOK_URL = 'SUA_URL_DE_GERACAO_AQUI';
const HISTORICO_URL = 'SUA_URL_DE_HISTORICO_AQUI';
```

**treino.js:**
```javascript
const API_URL = 'SUA_URL_DE_CONSULTA_AQUI';
```

## 🌐 Deploy

### Hospedagem Estática
O projeto pode ser hospedado em qualquer serviço de hospedagem estática:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

### Estrutura de URLs
- `/` - Página principal
- `/treino.html?id=TREINO_ID` - Visualização de treino específico

## 📱 Responsividade

O projeto é totalmente responsivo e funciona bem em:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)

## 🔧 Tecnologias

- **HTML5**: Estrutura semântica
- **CSS3**: Flexbox, Grid, Animações
- **JavaScript ES6+**: Async/await, Modules
- **Clerk**: Autenticação
- **Fetch API**: Requisições HTTP

## 📈 Performance

### Otimizações Implementadas
- ✅ CSS e JS externos (cache do navegador)
- ✅ Código minificado e organizado
- ✅ Imagens otimizadas (SVG icons)
- ✅ Loading assíncrono

### Métricas Esperadas
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 🐛 Debugging

### Console Logs
O projeto inclui logs detalhados para debugging:
- ✅ Estados de autenticação
- ✅ Requisições de API
- ✅ Erros e exceções

### Tratamento de Erros
- ✅ Fallbacks para APIs indisponíveis
- ✅ Mensagens de erro amigáveis
- ✅ Estados de loading apropriados

## 🔄 Próximas Melhorias

### Funcionalidades
- [ ] PWA (Progressive Web App)
- [ ] Modo offline
- [ ] Notificações push
- [ ] Exportar treino em PDF

### Técnicas
- [ ] Service Workers
- [ ] Lazy loading de imagens
- [ ] Compressão de assets
- [ ] CDN para recursos estáticos

---

**Desenvolvido com ❤️ para uma melhor experiência de treino!**