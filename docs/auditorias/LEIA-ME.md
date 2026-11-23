# Auditorias do Caracterizador Pericial

Relatórios das auditorias independentes feitas em 23/11/2026. Cada achado tem severidade, evidência, causa e correção proposta; as correções foram aplicadas em PRs separados (veja o histórico do repositório).

| Arquivo | Tema |
|---|---|
| `0-usabilidade.md` | Usabilidade dos campos de entrada e fluxos (PRs #27 a #33) |
| `1-calculos.md` | Cálculos e regras: 152 verificações por recálculo independente |
| `2-seguranca-7-desempenho.md` | Segurança, LGPD e desempenho |
| `3-compat-4-acessibilidade.md` | Compatibilidade entre navegadores e acessibilidade (WCAG 2.2 AA) |
| `5-visual-6-redacao.md` | Visual, impressão, redação e terminologia |
| `tests-sugeridos.mjs` | Casos de referência da auditoria de cálculos, incorporados aos testes |

Limitações: Safari e Firefox não foram executados (revisão de código e emulação no Chromium). A interpretação jurídica e técnica das regras deve ser revista por profissionais (advogado e engenheiro/médico do trabalho), e o teste com usuários reais não foi feito.
