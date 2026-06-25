import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export type TaskColor = "red" | "blue" | "green" | "orange" | "gray";

export interface Task {
  id: string;
  text: string;
  detail: string;
  location: string;
  pins: string[];
  trackingCode: string;
  deadline: string;
  scheduledTime: string;
  color: TaskColor;
  checked: boolean;
}

export interface DayPlan {
  date: string;
  tasks: Task[];
}

export interface PlannerSettings {
  fontSizeMultiplier: number;
  compactMode: boolean;
}

const DEFAULT_TASKS: Task[] = [
  {
    id: uuidv4(),
    text: "Recolher Encomendas - Locky",
    detail: "",
    location: "Loja CTT Santa Maria da Feira",
    pins: ["749247", "736464"],
    trackingCode: "",
    deadline: "",
    scheduledTime: "",
    color: "red",
    checked: false,
  },
  {
    id: uuidv4(),
    text: "Recolher Encomenda - Passerelle",
    detail: "Destinatario: Gustavo Sousa (pesado)",
    location: "Minimercado Passerelle",
    pins: ["645466"],
    trackingCode: "",
    deadline: "",
    scheduledTime: "",
    color: "blue",
    checked: false,
  },
  {
    id: uuidv4(),
    text: "Levantar encomenda Zalando",
    detail: "",
    location: "Ponto CTT Escapaes",
    pins: [],
    trackingCode: "DT913606694PT",
    deadline: "08/07/2026",
    scheduledTime: "",
    color: "green",
    checked: false,
  },
  {
    id: uuidv4(),
    text: "Tirar fotos das casas",
    detail: "Lugar da Linha de Comboio, Rua Fechada",
    location: "CTT Escapaes",
    pins: [],
    trackingCode: "",
    deadline: "",
    scheduledTime: "",
    color: "orange",
    checked: false,
  },
  {
    id: uuidv4(),
    text: 'Limpar orders com status "Needs action"',
    detail: "Rever e processar todas as encomendas assinaladas",
    location: "Online",
    pins: [],
    trackingCode: "",
    deadline: "",
    scheduledTime: "",
    color: "gray",
    checked: false,
  },
];

const COLOR_ORDER: TaskColor[] = ["red", "blue", "green", "orange", "gray"];

function getNextColor(tasks: Task[]): TaskColor {
  const counts: Record<TaskColor, number> = {
    red: 0, blue: 0, green: 0, orange: 0, gray: 0,
  };
  tasks.forEach((t) => counts[t.color]++);
  return COLOR_ORDER.reduce((a, b) => (counts[a] <= counts[b] ? a : b));
}

function getToday(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function formatDatePt(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getWeekdayPt(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-PT", { weekday: "long" });
}

interface PlannerState {
  currentDate: string;
  plans: Record<string, DayPlan>;
  settings: PlannerSettings;
  _initialized: boolean;

  initializeIfNeeded: () => void;
  setCurrentDate: (date: string) => void;
  addTask: () => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleTask: (taskId: string) => void;
  duplicateDay: (fromDate: string, toDate: string) => void;
  clearCompleted: () => void;
  updateSettings: (updates: Partial<PlannerSettings>) => void;

  getCurrentTasks: () => Task[];
  getCurrentDateFormatted: () => string;
  getCurrentWeekday: () => string;
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      currentDate: getToday(),
      plans: {},
      settings: {
        fontSizeMultiplier: 1,
        compactMode: false,
      },
      _initialized: false,

      initializeIfNeeded: () => {
        const { plans, _initialized } = get();
        if (_initialized) return;
        const today = getToday();
        const hasAnyPlan = Object.keys(plans).length > 0;
        if (!hasAnyPlan) {
          set({
            plans: {
              [today]: { date: today, tasks: DEFAULT_TASKS },
            },
            currentDate: today,
          });
        }
        set({ _initialized: true });
      },

      setCurrentDate: (date) => set({ currentDate: date }),

      addTask: () => {
        const { currentDate, plans } = get();
        const existing = plans[currentDate]?.tasks ?? [];
        const newTask: Task = {
          id: uuidv4(),
          text: "",
          detail: "",
          location: "",
          pins: [],
          trackingCode: "",
          deadline: "",
          scheduledTime: "",
          color: getNextColor(existing),
          checked: false,
        };
        set({
          plans: {
            ...plans,
            [currentDate]: { date: currentDate, tasks: [...existing, newTask] },
          },
        });
      },

      updateTask: (taskId, updates) => {
        const { currentDate, plans } = get();
        const existing = plans[currentDate]?.tasks ?? [];
        set({
          plans: {
            ...plans,
            [currentDate]: {
              date: currentDate,
              tasks: existing.map((t) =>
                t.id === taskId ? { ...t, ...updates } : t
              ),
            },
          },
        });
      },

      deleteTask: (taskId) => {
        const { currentDate, plans } = get();
        const existing = plans[currentDate]?.tasks ?? [];
        set({
          plans: {
            ...plans,
            [currentDate]: {
              date: currentDate,
              tasks: existing.filter((t) => t.id !== taskId),
            },
          },
        });
      },

      toggleTask: (taskId) => {
        const { currentDate, plans } = get();
        const existing = plans[currentDate]?.tasks ?? [];
        set({
          plans: {
            ...plans,
            [currentDate]: {
              date: currentDate,
              tasks: existing.map((t) =>
                t.id === taskId ? { ...t, checked: !t.checked } : t
              ),
            },
          },
        });
      },

      duplicateDay: (fromDate, toDate) => {
        const { plans } = get();
        const fromTasks = plans[fromDate]?.tasks ?? [];
        const dupTasks = fromTasks.map((t) => ({
          ...t,
          id: uuidv4(),
          checked: false,
        }));
        set({
          plans: {
            ...plans,
            [toDate]: { date: toDate, tasks: dupTasks },
          },
        });
      },

      clearCompleted: () => {
        const { currentDate, plans } = get();
        const existing = plans[currentDate]?.tasks ?? [];
        set({
          plans: {
            ...plans,
            [currentDate]: {
              date: currentDate,
              tasks: existing.filter((t) => !t.checked),
            },
          },
        });
      },

      updateSettings: (updates) => {
        set({ settings: { ...get().settings, ...updates } });
      },

      getCurrentTasks: () => {
        const { currentDate, plans } = get();
        return plans[currentDate]?.tasks ?? [];
      },

      getCurrentDateFormatted: () => formatDatePt(get().currentDate),
      getCurrentWeekday: () => {
        const day = getWeekdayPt(get().currentDate);
        return day.charAt(0).toUpperCase() + day.slice(1);
      },
    }),
    {
      name: "planner-storage",
    }
  )
);