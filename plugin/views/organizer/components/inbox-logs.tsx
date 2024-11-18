import * as React from "react";
import {
  FileRecord,
  LogEntry,
  Action,
  FileStatus,
} from "../../../inbox/services/record-manager";
import moment from "moment";
import {
  ChevronDown,
  Clock,
  Play,
  Check,
  AlertCircle,
  Ban,
  Search,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlugin } from "../provider";
import { Inbox } from "../../../inbox";

// Simple log entry display component
const LogEntryDisplay: React.FC<{ entry: LogEntry; step: Action }> = ({
  entry,
  step,
}) => {
  const getDisplayText = (step: Action, completed: boolean) => {
    if (completed) {
      switch (step) {
        case Action.CLEANUP:
          return "file cleaned up";
        case Action.RENAME:
          return "file renamed";
        case Action.EXTRACT:
          return "text extracted";
        case Action.MOVING_ATTACHEMENT:
          return "attachments moved";
        case Action.CLASSIFY:
          return "classified";
        case Action.TAGGING:
          return "tags recommended";
        case Action.APPLYING_TAGS:
          return "tags applied";
        case Action.RECOMMEND_NAME:
          return "name recommended";
        case Action.APPLYING_NAME:
          return "name applied";
        case Action.FORMATTING:
          return "formatted";
        case Action.MOVING:
          return "moved";
        case Action.COMPLETED:
          return "completed";
        default:
          return step;
      }
    }
    return step;
  };

  return (
    <div className="flex items-center gap-2 py-1">
      <div
        className={`w-2 h-2 rounded-full ${
          entry.completed ? "bg-[--text-success]" : "bg-[--text-accent]"
        }`}
      />
      <span className="text-[--text-muted] w-20 text-xs">
        {moment(entry.timestamp).format("HH:mm:ss")}
      </span>
      <span className="text-sm text-[--text-muted]">
        {getDisplayText(step, entry.completed)}
      </span>
      {entry.error && (
        <span className="text-sm text-[--text-error]">
          {entry.error.message}
        </span>
      )}
    </div>
  );
};

// Main file card component
function FileCard({ record }: { record: FileRecord }) {
  const plugin = usePlugin();
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Get sorted actions based on timestamp
  const sortedActions = React.useMemo(() => {
    return Object.entries(record.logs)
      .sort(([, a], [, b]) => moment(b.timestamp).diff(moment(a.timestamp)))
      .map(([action]) => action as Action);
  }, [record.logs]);

  return (
    <motion.div
      layout
      className="bg-[--background-primary] border border-[--background-modifier-border] rounded-lg"
    >
      <div className="p-4">
        {/* Basic file info */}
        <div className="flex items-center justify-between mb-2 gap-3">
          <div className="flex items-center gap-2">
            <a
              className="text-[--text-accent] hover:underline"
              href="#"
              onClick={() =>
                plugin.app.workspace.openLinkText(
                  record.file?.basename,
                  record.file?.parent.path
                )
              }
            >
              {record.file ? record.file?.basename : "No file"}
            </a>
            <StatusBadge status={record.status} />
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-[--text-muted]"
          >
            <ChevronDown
              className={`w-4 h-4 ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Always visible info */}
        <div className="space-y-2">
          {record.classification && (
            <div className="text-sm">
              Classification:{" "}
              <span className="text-[--text-accent]">
                {record.classification}
              </span>
            </div>
          )}
          {record.tags.length > 0 && (
            <div className="flex gap-1">
              {record.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-[--background-secondary] rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 space-y-2 border-t border-[--background-modifier-border] pt-4"
            >
              {/* Path info */}
              {record.newPath && (
                <div className="text-sm">
                  New path:{" "}
                  <span className="text-[--text-accent]">{record.newPath}</span>
                </div>
              )}
              {record.newName && (
                <div className="text-sm">
                  New name:{" "}
                  <span className="text-[--text-accent]">{record.newName}</span>
                </div>
              )}

              {/* Actions line */}
              <div className="flex items-center gap-2 text-sm border-b border-[--background-modifier-border] pb-4">
                <span className="text-[--text-muted]">Actions:</span>
                <div className="flex flex-wrap gap-1">
                  {sortedActions.map(action => (
                    <span
                      key={action}
                      className="px-2 py-0.5 bg-[--background-secondary] rounded-full text-xs capitalize"
                    >
                      {action}
                    </span>
                  ))}
                </div>
              </div>

              {/* Logs grouped by step */}
              <div className="space-y-4">
                {Object.entries(Action).map(([, action]) => {
                  const log = record.logs[action];
                  if (!log) return null;

                  return (
                    <div key={action} className="space-y-1">
                      <LogEntryDisplay entry={log} step={action} />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Status badge component
const StatusBadge: React.FC<{ status: FileStatus }> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "bg-[--text-success]";
      case "error":
        return "bg-[--text-error]";
      case "processing":
        return "bg-[--text-accent]";
      default:
        return "bg-[--text-muted]";
    }
  };

  return (
    <span className="inline-flex items-center">
      <span className="sr-only">{status}</span>
      <span
        className={`w-2 h-2 rounded-full ${getStatusColor()}`}
        aria-hidden="true"
      />
    </span>
  );
};

// Analytics component
const InboxAnalytics: React.FC<{
  analytics: ReturnType<typeof Inbox.prototype.getAnalytics>;
}> = ({ analytics }) => {
  const { byStatus } = analytics;

  // Split statuses into main flow and exceptions
  const mainFlow: Array<{
    status: FileStatus;
    icon: React.ReactNode;
  }> = [
    { status: "queued", icon: <Clock className="w-4 h-4" /> },
    { status: "processing", icon: <Play className="w-4 h-4" /> },
    { status: "completed", icon: <Check className="w-4 h-4" /> },
  ];

  const exceptions: Array<{
    status: FileStatus;
    icon: React.ReactNode;
  }> = [
    { status: "error", icon: <AlertCircle className="w-4 h-4" /> },
    { status: "bypassed", icon: <Ban className="w-4 h-4" /> },
  ];

  const StatusBox = ({
    status,
    icon,
  }: {
    status: FileStatus;
    icon: React.ReactNode;
  }) => (
    <div
      key={status}
      className="bg-[--background-primary] p-4 rounded text-center flex flex-col items-center"
    >
      <div className="text-sm capitalize">{status}</div>
      <div className="font-semibold">{byStatus[status] || 0}</div>
      <div className="mt-1 text-[--text-muted]">{icon}</div>
    </div>
  );

  return (
    <div className="bg-[--background-secondary] rounded-lg p-2">
      <div className="space-y-2">
        {/* Main flow row */}
        <div className="grid grid-cols-3 gap-2">
          {mainFlow.map(({ status, icon }) => (
            <StatusBox key={status} status={status} icon={icon} />
          ))}
        </div>

        {/* Exceptions row */}
        <div className="grid grid-cols-2 gap-2">
          {exceptions.map(({ status, icon }) => (
            <StatusBox key={status} status={status} icon={icon} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Search component
interface SearchBarProps {
  onSearch: (query: string) => void;
  onStatusFilter: (status: FileStatus | "") => void;
  selectedStatus: FileStatus | "";
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onStatusFilter,
  selectedStatus,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const statuses: Array<FileStatus | ""> = [
    "",
    "queued",
    "processing",
    "completed",
    "error",
    "bypassed",
  ];

  return (
    <div className="bg-[--background-primary] p-4 rounded-lg border border-[--background-modifier-border] space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[--text-muted]" />
          <input
            type="text"
            placeholder="Search files, tags, or actions..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 bg-[--background-secondary] rounded border border-[--background-modifier-border] text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[--text-muted]" />
          <select
            value={selectedStatus}
            onChange={e => onStatusFilter(e.target.value as FileStatus | "")}
            className="pl-9 pr-4 py-2 bg-[--background-secondary] rounded border border-[--background-modifier-border] text-sm appearance-none"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status
                  ? status.charAt(0).toUpperCase() + status.slice(1)
                  : "All Status"}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

// Main component
export const InboxLogs: React.FC = () => {
  const plugin = usePlugin();
  const [records, setRecords] = React.useState<FileRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = React.useState<FileRecord[]>(
    []
  );
  const [analytics, setAnalytics] =
    React.useState<ReturnType<typeof Inbox.prototype.getAnalytics>>();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<FileStatus | "">("");

  const filterRecords = React.useCallback(
    (records: FileRecord[]) => {
      return records.filter(record => {
        const matchesSearch = searchQuery
          .toLowerCase()
          .split(" ")
          .every(
            term =>
              record.file?.basename.toLowerCase().includes(term) ||
              record?.tags.some(tag => tag.toLowerCase().includes(term)) ||
              Object.keys(record.logs).some(action =>
                action.toLowerCase().includes(term)
              ) ||
              record.classification?.toLowerCase().includes(term)
          );

        const matchesStatus = !statusFilter || record.status === statusFilter;

        return matchesSearch && matchesStatus;
      });
    },
    [searchQuery, statusFilter]
  );

  React.useEffect(() => {
    const fetchData = () => {
      const files = plugin.inbox.getAllFiles();
      const currentAnalytics = plugin.inbox.getAnalytics();
      setRecords(files);
      setFilteredRecords(filterRecords(files));
      setAnalytics(currentAnalytics);
    };

    fetchData();
    const intervalId = setInterval(fetchData, 1000);
    return () => clearInterval(intervalId);
  }, [plugin.inbox, filterRecords]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleStatusFilter = (status: FileStatus | "") => {
    setStatusFilter(status);
  };

  return (
    <div className="space-y-4">
      {analytics && <InboxAnalytics analytics={analytics} />}

      <SearchBar
        onSearch={handleSearch}
        onStatusFilter={handleStatusFilter}
        selectedStatus={statusFilter}
      />

      {filteredRecords.map(record => (
        <FileCard key={record.id} record={record} />
      ))}
      {filteredRecords.length === 0 && (
        <div className="text-center py-8 text-[--text-muted]">
          {records.length === 0 ? "No records found" : "No matching records"}
        </div>
      )}
    </div>
  );
};
