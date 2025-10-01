# easyMoto Mobile ✨📱

> App mobile **React Native + Expo** para gestão de motos, pátio e operação de locação. Integra com backend **.NET/C#** e exibe **notificações padronizadas**, **relatórios** com gráfico e **visualização do pátio** com ícone/cores por status.

**Backend (Swagger):** http://172.203.27.184/swagger/index.html  
**Mobile:** Expo + TypeScript + Axios + React Navigation

---
## ✨ Recursos principais

- **Autenticação** com `AsyncStorage` (token JWT em `Authorization`)
- **Cadastro / edição / exclusão de motos** (placa, modelo, ano, tipo, status, legenda)
- **Pátio (Patio.tsx)** com **ícone de moto** e **cor** conforme legenda
- **Notificações (Notificacoes.tsx)** padronizadas ao cadastrar/atualizar  
  Formato: **`Operador: NOME Cadastrou a moto: PLACA MODELO`**
- **Relatório (Relatorio.tsx)** com **react-native-chart-kit** (barras por status)
- **Tema claro/escuro** (`ThemeContext` + `ThemeToggleButton`)
- **Qualidade de código**: ESLint v9 (flat) + Prettier.

---

## ☕️ Stack

- **React Native** + **TypeScript**
- **Navegação:** `@react-navigation/native`, Stack e Bottom Tabs
- **HTTP:** `axios`
- **Storage:** `@react-native-async-storage/async-storage`
- **Gráficos:** `react-native-chart-kit` + `react-native-svg`
- **UI extra:** `react-native-paper`, `expo-linear-gradient`, `@expo/vector-icons`
- **Lint/Format:** ESLint v9 (flat config) + Prettier

---
## 🚀 Como rodar

1) **Pré-requisitos**
- Node LTS (18+ recomendado)
- NPM
- Expo Go 

2) **Instale**
```bash
npm install
```

3) **Configure o Axios**
- Em `src/services/api.ts`, ajuste `baseURL` para o backend (ex.: `http://172.203.27.184`).

4) **Execute**
```bash
npm run start

# Dispositivo/emulador
npm run android   # Android
npm run ios       # iOS (macOS)

# Web
npm run web
```
---

## 👥 Equipe:

* ⭐️ **Valéria Conceição Dos Santos** — RM: **557177**  
* ⭐️ **Mirela Pinheiro Silva Rodrigues** — RM: **558191**
* ⭐️ **Luiz Eduardo Da Silva Pinto** — RM: **555213**
