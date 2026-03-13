# ETAPA 14 — Padrões de Qualidade

- **TypeScript estrito:** strict: true; noImplicitAny, strictNullChecks; tipar retornos e parâmetros.
- **SOLID:** Serviços com responsabilidade única; injeção de dependência (NestJS); interfaces para abstrações (ex.: storage de anexos).
- **DTOs e validação:** DTOs para entrada e saída; class-validator (ou Zod) em todos os inputs; não expor entidades Prisma diretamente.
- **Tratamento de erros:** Filtro de exceções global (ExceptionFilter); códigos HTTP corretos (400, 401, 403, 404, 409, 500); mensagens consistentes; não vazar detalhes internos em prod.
- **Resposta padronizada:** Envelope comum, ex.: `{ data?, error?, meta? }`; paginação com page, limit, total.
- **Logs estruturados:** Pino; não logar dados sensíveis; correlation id em requests quando possível.
- **Testes:** Unitários nos serviços (regras de negócio); integração nos controllers e fluxos críticos (auth, lançamento, baixa); mocks para Prisma e Redis.
- **Desacoplamento:** Módulos com fronteiras claras; evitar import circular; uso de eventos ou filas para integração entre módulos quando crescer.

---

*Documento parte do projeto CashFlow SaaS — Etapa 14.*
