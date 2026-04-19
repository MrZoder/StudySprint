import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { usePlanner } from "../context/usePlanner";
import { useToast } from "../context/useToast";
import AssignmentCard from "../components/AssignmentCard";
import type { Priority } from "../types";
import { formatDaysLeft } from "../lib/planner";
import {
  assignmentTitleTaken,
  isBlank,
  isHtmlDateInPast,
  parseHtmlDateValue,
} from "../lib/formValidation";
import Button from "../components/ui/Button";
import ConfirmationDialog from "../components/ui/ConfirmationDialog";
import FormAssist from "../components/ui/FormAssist";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Textarea from "../components/ui/Textarea";

export default function AssignmentDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const {
    subjects,
    assignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment,
    restoreAssignment,
    toggleSubtask,
    toggleAssignmentComplete,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    moveSubtask,
  } = usePlanner();
  const { showToast } = useToast();
  const assignment = getAssignmentById(id);

  const [title, setTitle] = useState(assignment?.title ?? "");
  const [subjectId, setSubjectId] = useState(assignment?.subjectId ?? "");
  const [dueDate, setDueDate] = useState(
    assignment ? new Date(assignment.dueDate).toISOString().slice(0, 10) : "",
  );
  const [priority, setPriority] = useState<Priority>(assignment?.priority ?? "Medium");
  const [notes, setNotes] = useState(assignment?.notes ?? "");
  const [showErrors, setShowErrors] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const next = assignments.find((a) => a.id === id);
    if (!next) return;
    setTitle(next.title);
    setSubjectId(next.subjectId);
    setDueDate(new Date(next.dueDate).toISOString().slice(0, 10));
    setPriority(next.priority);
    setNotes(next.notes ?? "");
    // Re-seed only when the route id changes; omit `assignments` so subtask/progress updates do not reset the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const titleError = showErrors && isBlank(title) ? "Title is required." : undefined;
  const subjectError = showErrors && !subjectId ? "Select a subject." : undefined;
  const dueError =
    showErrors && (!dueDate || !parseHtmlDateValue(dueDate))
      ? "Choose a valid due date."
      : undefined;
  const duplicateTitleError =
    subjectId && !isBlank(title) && assignmentTitleTaken(assignments, subjectId, title, id)
      ? "Another assignment in this subject already uses this title."
      : undefined;

  const formHasErrors = Boolean(titleError || subjectError || dueError || duplicateTitleError);

  const assignmentValid = useMemo(
    () =>
      !isBlank(title) &&
      Boolean(subjectId) &&
      Boolean(parseHtmlDateValue(dueDate)) &&
      !assignmentTitleTaken(assignments, subjectId, title, id),
    [title, subjectId, dueDate, assignments, id],
  );

  const dueDateWarning =
    dueDate && parseHtmlDateValue(dueDate) && isHtmlDateInPast(dueDate)
      ? "This due date is in the past. It may show as overdue until you complete the work."
      : undefined;

  useEffect(() => {
    if (!saveMessage) return;
    const t = window.setTimeout(() => setSaveMessage(null), 2800);
    return () => window.clearTimeout(t);
  }, [saveMessage]);

  if (!assignment) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-600 dark:border-gray-700 dark:text-gray-300">
        Assignment not found.{" "}
        <Link className="text-blue-600 hover:underline" to="/assignments">
          Back to assignments
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <Link
          to="/assignments"
          className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-blue-600 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-300 dark:active:bg-gray-800/80"
        >
          <ArrowLeft size={18} className="shrink-0" />
          Back to assignments
        </Link>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 md:p-5 dark:border-blue-900/50 dark:from-blue-950/40 dark:to-cyan-950/30">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{assignment.title}</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {formatDaysLeft(assignment.dueDate)} · {assignment.priority} priority
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5 lg:items-start">
        <div className="min-w-0 lg:col-span-3">
          <AssignmentCard
            assignment={assignment}
            subjects={subjects}
            onToggleSubtask={toggleSubtask}
            onToggleAssignmentComplete={toggleAssignmentComplete}
            onAddSubtask={addSubtask}
            onUpdateSubtask={updateSubtask}
            onDeleteSubtask={deleteSubtask}
            onMoveSubtask={moveSubtask}
            emphasis="default"
          />
        </div>
        <form
          className={`lg:col-span-2 space-y-3 rounded-2xl border bg-white p-4 shadow-sm sm:p-5 dark:bg-gray-900 ${
            formHasErrors
              ? "border-rose-200 dark:border-rose-900/55"
              : "border-gray-200 dark:border-gray-800"
          }`}
          onSubmit={(event) => {
            event.preventDefault();
            setShowErrors(true);
            if (!assignmentValid) return;
            updateAssignment(id, {
              title: title.trim(),
              subjectId,
              dueDate: new Date(`${dueDate}T12:00:00`).toISOString(),
              priority,
              notes: notes.trim() || undefined,
            });
            setShowErrors(false);
            setSaveMessage("Changes saved.");
          }}
          noValidate
        >
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Assignment</h2>
            <FormAssist
              tone="muted"
              message="Update fields and save. Title must stay unique within the selected subject."
              className="mt-1"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400" htmlFor="edit-title">
              Title
            </label>
            <Input
              id="edit-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title"
              className="w-full"
              hasError={Boolean(titleError || duplicateTitleError)}
            />
            <FormAssist message={titleError} tone="error" />
            <FormAssist message={duplicateTitleError} tone="error" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400" htmlFor="edit-subject">
              Subject
            </label>
            <Select
              id="edit-subject"
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
              className="w-full"
              hasError={Boolean(subjectError)}
            >
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.code} - {subject.name}
                </option>
              ))}
            </Select>
            <FormAssist message={subjectError} tone="error" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400" htmlFor="edit-due">
              Due date
            </label>
            <Input
              id="edit-due"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="w-full"
              hasError={Boolean(dueError)}
            />
            <FormAssist message={dueError} tone="error" />
            <FormAssist message={dueDateWarning} tone="warning" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400" htmlFor="edit-priority">
              Priority
            </label>
            <Select
              id="edit-priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value as Priority)}
              className="w-full"
            >
              {["Low", "Medium", "High", "Urgent"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400" htmlFor="edit-notes">
              Notes
            </label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Notes (optional)"
              rows={4}
              className="w-full"
            />
          </div>

          {saveMessage && <FormAssist message={saveMessage} tone="success" />}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              type="submit"
              disabled={!assignmentValid}
              iconLeft={<Save size={16} />}
              className="order-2 w-full min-h-11 sm:order-1 sm:w-auto"
            >
              Save changes
            </Button>
            <Button
              type="button"
              onClick={() => setDeleteDialogOpen(true)}
              variant="danger"
              iconLeft={<Trash2 size={16} />}
              className="order-1 w-full min-h-11 sm:order-2 sm:w-auto"
            >
              Delete
            </Button>
          </div>
        </form>
      </div>

      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        title="Delete this assignment?"
        description={`“${assignment.title}” and all subtasks will be removed. You will return to the assignments list. Use Undo on the banner within a few seconds if you change your mind.`}
        confirmLabel="Delete assignment"
        cancelLabel="Cancel"
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={() => {
          setDeleteDialogOpen(false);
          const copy = structuredClone(assignment);
          deleteAssignment(id);
          navigate("/assignments");
          showToast({
            message: `Assignment deleted: “${copy.title}”`,
            tone: "destructive",
            durationMs: 8000,
            action: {
              label: "Undo",
              onPress: () => {
                restoreAssignment(copy);
                navigate(`/assignments/${copy.id}`);
              },
            },
          });
        }}
      />
    </div>
  );
}
