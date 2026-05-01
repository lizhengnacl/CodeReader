# Prototype Workspace

## 目录结构

### codebase (代码目录)

代码文件，包含原型的完整代码实现。

```
├── src/
│   ├── lib/
│   │   └── utils.ts
│   ├── pages/
│   │   ├── tabs/
│   │   │   ├── FilesTab.tsx
│   │   │   ├── GitTab.tsx
│   │   │   ├── SearchTab.tsx
│   │   │   └── SettingsTab.tsx
│   │   ├── CodeViewer.tsx
│   │   ├── ProjectList.tsx
│   │   └── Workspace.tsx
│   └── App.tsx
├── dependencies.json
├── meta.json
└── prototype-route.json
```

### notebook (代码生成时候的笔记)

笔记文件，记录代码生成过程中的思考和决策。

```
├── plan-round-1.md
├── plan-round-2.md
└── prd-overview.md
```