"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePlannerStore, type Task, type TaskColor } from "@/lib/planner-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CalendarIcon,
  Download,
  Plus,
  Trash2,
  Settings2,
  Check,
  ChevronLeft,
  ChevronRight,
  Pin,
  PackageSearch,
  MapPin,
  Clock,
  Loader2,
  Eraser,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const COLOR_MAP: Record<TaskColor, { bg: string; icon: string; border: string }> = {
  red: { bg: "bg-red-500", icon: "text-red-500", border: "border-red-200" },
  blue: { bg: "bg-blue-500", icon: "text-blue-500", border: "border-blue-200" },
  green: { bg: "bg-emerald-500", icon: "text-emerald-500", border: "border-emerald-200" },
  orange: { bg: "bg-orange-500", icon: "text-orange-500", border: "border-orange-200" },
  gray: { bg: "bg-gray-400", icon: "text-gray-400", border: "border-gray-200" },
};

const ALL_COLORS: TaskColor[] = ["red", "blue", "green", "orange", "gray"];

function TaskCard({
  task,
  index,
  fontSizeMultiplier,
  compactMode,
  onUpdate,
  onDelete,
  onToggle,
}: {
  task: Task;
  index: number;
  fontSizeMultiplier: number;
  compactMode: boolean;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const [pinsInput, setPinsInput] = useState("");
  const [editingPins, setEditingPins] = useState(false);

  const baseSize = compactMode ? 13 : 14;
  const detailSize = compactMode ? 11 : 12;
  const badgeSize = compactMode ? 10 : 11;

  const handlePinsBlur = () => {
    const cleaned = pinsInput
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    onUpdate({ pins: cleaned });
    setEditingPins(false);
  };

  const colorStyle = COLOR_MAP[task.color];

  return (
    <div
      className={cn(
        "rounded-lg border bg-white transition-all duration-200",
        colorStyle.border,
        task.checked && "opacity-50"
      )}
    >
      <div className="flex items-start gap-3 p-3 sm:p-4">
        <button
          onClick={onToggle}
          className="mt-0.5 flex-shrink-0"
          aria-label={task.checked ? "Desmarcar tarefa" : "Marcar tarefa"}
        >
          <div
            className={cn(
              "h-5 w-5 rounded border-2 flex items-center justify-center transition-all",
              task.checked
                ? `${colorStyle.bg} border-transparent`
                : "border-gray-300 hover:border-gray-400"
            )}
          >
            {task.checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
          </div>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div
              className={cn(
                "flex-shrink-0 h-6 w-6 rounded flex items-center justify-center text-white font-bold",
                colorStyle.bg,
                compactMode ? "text-xs h-5 w-5" : "text-xs"
              )}
            >
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <Input
                value={task.text}
                onChange={(e) => onUpdate({ text: e.target.value })}
                placeholder="Descrever a tarefa..."
                className={cn(
                  "font-medium border-0 shadow-none p-0 h-auto focus-visible:ring-0",
                  task.checked && "line-through text-gray-400"
                )}
                style={{ fontSize: `${baseSize * fontSizeMultiplier}px` }}
              />
            </div>
          </div>

          {/* Inline description textarea */}
          <div className="ml-8 mt-1.5">
            <textarea
              value={task.detail}
              onChange={(e) => onUpdate({ detail: e.target.value })}
              placeholder="Adicionar descricao..."
              rows={task.detail ? Math.min(Math.max(task.detail.split("\n").length, 1), 4) : 1}
              className={cn(
                "w-full border-0 bg-transparent text-gray-500 italic resize-none p-0 focus:outline-none focus:ring-0 placeholder:text-gray-300",
                task.checked && "line-through text-gray-400"
              )}
              style={{ fontSize: `${detailSize * fontSizeMultiplier}px` }}
            />
          </div>

          {/* Inline scheduled time */}
          <div className="ml-8 mt-1.5 flex items-center gap-1.5">
            <Clock className="h-3 w-3 flex-shrink-0 text-gray-400" />
            <input
              type="time"
              value={task.scheduledTime}
              onChange={(e) => onUpdate({ scheduledTime: e.target.value })}
              className={cn(
                "border-0 bg-transparent p-0 h-auto focus:outline-none focus:ring-0 text-gray-600",
                task.checked && "text-gray-400"
              )}
              style={{ fontSize: `${detailSize * fontSizeMultiplier}px` }}
            />
          </div>

          {task.location && (
            <div
              className="flex items-center gap-1 ml-8 mt-1 text-gray-500"
              style={{ fontSize: `${detailSize * fontSizeMultiplier}px` }}
            >
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span>{task.location}</span>
            </div>
          )}

          <div className="ml-8 mt-2 flex flex-wrap gap-2 items-center">
            {task.pins.map((pin, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 bg-gray-900 text-white px-2.5 py-0.5 rounded font-semibold"
                style={{ fontSize: `${badgeSize * fontSizeMultiplier}px` }}
              >
                <Pin className="h-2.5 w-2.5 opacity-60" />
                {pin}
              </span>
            ))}
            {!editingPins && (
              <button
                onClick={() => {
                  setPinsInput(task.pins.join(", "));
                  setEditingPins(true);
                }}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                style={{ fontSize: `${badgeSize * fontSizeMultiplier}px` }}
              >
                + PIN
              </button>
            )}
            {editingPins && (
              <input
                value={pinsInput}
                onChange={(e) => setPinsInput(e.target.value)}
                onBlur={handlePinsBlur}
                onKeyDown={(e) => e.key === "Enter" && handlePinsBlur()}
                placeholder="PINs separados por virgula"
                className="border rounded px-2 py-0.5 text-xs w-40 focus:outline-none focus:ring-1 focus:ring-gray-400"
                style={{ fontSize: `${badgeSize * fontSizeMultiplier}px` }}
                autoFocus
              />
            )}
          </div>

          {task.trackingCode && (
            <div className="ml-8 mt-2">
              <span
                className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-0.5 rounded font-semibold"
                style={{ fontSize: `${badgeSize * fontSizeMultiplier}px` }}
              >
                <PackageSearch className="h-3 w-3" />
                {task.trackingCode}
              </span>
            </div>
          )}

          {task.deadline && (
            <div className="ml-8 mt-2">
              <span
                className="inline-flex items-center gap-1 bg-red-50 text-red-500 border border-red-200 px-2 py-0.5 rounded font-semibold"
                style={{ fontSize: `${(badgeSize - 1) * fontSizeMultiplier}px` }}
              >
                <Clock className="h-2.5 w-2.5" />
                Prazo ate {task.deadline}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-400 hover:text-gray-600"
              >
                <Settings2 className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Editar tarefa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Detalhe</Label>
                  <textarea
                    value={task.detail}
                    onChange={(e) => onUpdate({ detail: e.target.value })}
                    placeholder="Info adicional..."
                    rows={3}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora prevista</Label>
                  <Input
                    type="time"
                    value={task.scheduledTime}
                    onChange={(e) => onUpdate({ scheduledTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Localizacao</Label>
                  <Input
                    value={task.location}
                    onChange={(e) => onUpdate({ location: e.target.value })}
                    placeholder="Onde?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Codigo de rastreamento</Label>
                  <Input
                    value={task.trackingCode}
                    onChange={(e) => onUpdate({ trackingCode: e.target.value })}
                    placeholder="DT000000000PT"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prazo</Label>
                  <Input
                    value={task.deadline}
                    onChange={(e) => onUpdate({ deadline: e.target.value })}
                    placeholder="DD/MM/AAAA"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cor</Label>
                  <div className="flex gap-2">
                    {ALL_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => onUpdate({ color: c })}
                        className={cn(
                          "h-8 w-8 rounded-full transition-all",
                          COLOR_MAP[c].bg,
                          task.color === c
                            ? "ring-2 ring-offset-2 ring-gray-900 scale-110"
                            : "opacity-60 hover:opacity-100"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-red-500"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PlannerApp() {
  const plannerRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const {
    currentDate,
    plans,
    settings,
    setCurrentDate,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    clearCompleted,
    updateSettings,
    getCurrentTasks,
    getCurrentDateFormatted,
    getCurrentWeekday,
  } = usePlannerStore();

  const initializeIfNeeded = usePlannerStore((s) => s.initializeIfNeeded);

  useEffect(() => {
    initializeIfNeeded();
  }, [initializeIfNeeded]);

  const tasks = getCurrentTasks();
  const dateFormatted = getCurrentDateFormatted();
  const weekday = getCurrentWeekday();

  const navigateDay = useCallback(
    (direction: number) => {
      const d = new Date(currentDate + "T12:00:00");
      d.setDate(d.getDate() + direction);
      setCurrentDate(d.toISOString().split("T")[0]);
    },
    [currentDate, setCurrentDate]
  );

  const handleDownloadPDF = async () => {
    if (!plannerRef.current) return;
    setGenerating(true);
    try {
      const dateSlug = currentDate.replace(/-/g, "_");
      const { generatePDF } = await import("@/lib/pdf-generator");
      await generatePDF(
        "planner-content",
        `plano_do_dia_${dateSlug}.pdf`
      );
      toast.success("PDF gerado com sucesso!");
    } catch {
      toast.error("Erro ao gerar PDF. Tenta novamente.");
    } finally {
      setGenerating(false);
    }
  };

  const taskCount = tasks.length;
  const completedCount = tasks.filter((t) => t.checked).length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top toolbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDay(-1)}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="font-semibold gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>{dateFormatted}</span>
                <span className="text-xs text-muted-foreground font-normal capitalize">
                  {weekday}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={new Date(currentDate + "T12:00:00")}
                onSelect={(d) => {
                  if (d) {
                    setCurrentDate(d.toISOString().split("T")[0]);
                    setCalendarOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDay(1)}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="flex-1" />

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
            <span className="font-medium text-foreground">{completedCount}</span>
            <span>/</span>
            <span>{taskCount}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex gap-1.5"
            onClick={clearCompleted}
            disabled={completedCount === 0}
          >
            <Eraser className="h-3.5 w-3.5" />
            Limpar feitos
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Settings2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Definicoes</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-2">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Tamanho da fonte</Label>
                    <span className="text-sm text-muted-foreground font-mono">
                      {Math.round(settings.fontSizeMultiplier * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.fontSizeMultiplier * 100]}
                    onValueChange={([v]) =>
                      updateSettings({ fontSizeMultiplier: v / 100 })
                    }
                    min={70}
                    max={150}
                    step={5}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Pequeno</span>
                    <span>Normal</span>
                    <span>Grande</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modo compacto</Label>
                    <p className="text-xs text-muted-foreground">
                      Menos espacamento entre tarefas
                    </p>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(v) =>
                      updateSettings({ compactMode: v })
                    }
                  />
                </div>

                <Separator />

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    if (confirm("Apagar todas as tarefas do dia?")) {
                      const st = usePlannerStore.getState();
                      const newPlans = { ...st.plans };
                      delete newPlans[st.currentDate];
                      usePlannerStore.setState({ plans: newPlans });
                      toast.success("Tarefas apagadas");
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Apagar todas as tarefas do dia
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={handleDownloadPDF}
            disabled={generating || taskCount === 0}
            className="gap-2"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">PDF</span>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-20">
        <div
          id="planner-content"
          ref={plannerRef}
          className="bg-[#f5f5f0] rounded-xl p-6 sm:p-8 space-y-4"
          style={{
            fontSize: `${14 * settings.fontSizeMultiplier}px`,
          }}
        >
          {/* PDF Header */}
          <div className="flex justify-between items-end pb-4 border-b-2 border-gray-900">
            <div>
              <h1
                className="font-black tracking-tight text-gray-900"
                style={{
                  fontSize: `${(settings.compactMode ? 20 : 22) * settings.fontSizeMultiplier}px`,
                }}
              >
                PLANO DO DIA
              </h1>
              <p
                className="text-gray-400 tracking-widest uppercase mt-0.5"
                style={{
                  fontSize: `${(settings.compactMode ? 8 : 9) * settings.fontSizeMultiplier}px`,
                }}
              >
                Tarefas e recolhas
              </p>
            </div>
            <div className="text-right">
              <p
                className="font-bold text-gray-900"
                style={{
                  fontSize: `${(settings.compactMode ? 12 : 13) * settings.fontSizeMultiplier}px`,
                }}
              >
                {dateFormatted}
              </p>
              <p
                className="text-gray-400 uppercase tracking-wider capitalize"
                style={{
                  fontSize: `${(settings.compactMode ? 7 : 8) * settings.fontSizeMultiplier}px`,
                }}
              >
                {weekday}
              </p>
            </div>
          </div>

          {/* Task list */}
          <div
            className="space-y-3"
            style={{
              gap: `${settings.compactMode ? 10 : 16}px`,
            }}
          >
            {tasks.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                index={i}
                fontSizeMultiplier={settings.fontSizeMultiplier}
                compactMode={settings.compactMode}
                onUpdate={(updates) => updateTask(task.id, updates)}
                onDelete={() => deleteTask(task.id)}
                onToggle={() => toggleTask(task.id)}
              />
            ))}
          </div>

          {taskCount === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg font-medium">Sem tarefas para este dia</p>
              <p className="text-sm mt-1">
                Clica no botao + para adicionar
              </p>
            </div>
          )}

          {/* Blank lines for handwriting */}
          <div className="mt-6 pt-4">
            <p className="text-center text-gray-400 uppercase tracking-widest text-xs mb-4">
              Adicionar mais tarefas
            </p>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border-b border-gray-300 h-5" />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* FAB: Add task */}
      <div className="fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8">
        <Button
          onClick={addTask}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}