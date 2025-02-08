import { ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import { AssistantView } from "./organizer/organizer";
import FileOrganizer from "../..";
import { InboxLogs } from "./inbox-logs";
import { SectionHeader } from "./section-header";
import { AppContext } from "./provider";
import AIChatSidebar from "./ai-chat/container";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Meetings } from "./organizer/meetings/meetings";

export const ORGANIZER_VIEW_TYPE = "fo2k.assistant.sidebar2";

type Tab = "organizer" | "inbox" | "chat" | "meetings";

function TabContent({
  activeTab,
  plugin,
  leaf,
}: {
  activeTab: Tab;
  plugin: FileOrganizer;
  leaf: WorkspaceLeaf;
}) {
  const [activeFile, setActiveFile] = React.useState<TFile | null>(null);
  const [noteContent, setNoteContent] = React.useState<string>("");
  const [refreshKey, setRefreshKey] = React.useState<number>(0);

  React.useEffect(() => {
    const updateActiveFile = async () => {
      const file = plugin.app.workspace.getActiveFile();
      if (file) {
        const content = await plugin.app.vault.read(file);
        setNoteContent(content);
        setActiveFile(file);
      }
    };
    updateActiveFile();

    const handler = () => {
      updateActiveFile();
    };

    plugin.app.workspace.on("file-open", handler);
    plugin.app.workspace.on("active-leaf-change", handler);

    return () => {
      plugin.app.workspace.off("file-open", handler);
      plugin.app.workspace.off("active-leaf-change", handler);
    };
  }, [plugin.app.workspace, plugin.app.vault]);

  return (
    <div className="relative h-full">
      <div
        className={`absolute inset-0 ${
          activeTab === "organizer" ? "block" : "hidden"
        }`}
      >
        <AssistantView plugin={plugin} leaf={leaf} />
      </div>

      <div
        className={`absolute inset-0 ${
          activeTab === "inbox" ? "block" : "hidden"
        }`}
      >
        <SectionHeader text="Inbox Processing" icon="📥 " />
        <InboxLogs />
      </div>

      <div
        className={`absolute inset-0 ${
          activeTab === "chat" ? "block" : "hidden"
        }`}
      >
        <AIChatSidebar plugin={plugin} apiKey={plugin.settings.API_KEY} />
      </div>

      <div
        className={`absolute inset-0 ${
          activeTab === "meetings" ? "block" : "hidden"
        }`}
      >
        <div className="p-4">
          <SectionHeader text="Meeting Notes" icon="📅 " />
          <Meetings
            plugin={plugin}
            file={activeFile}
            content={noteContent}
            refreshKey={refreshKey}
          />
        </div>
      </div>
    </div>
  );
}

function TabButton({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`
                fo-px-3 fo-py-2 fo-text-sm fo-font-medium fo-shadow-none fo-cursor-pointer fo-bg-transparent

       ${
         isActive
           ? "fo-bg-[--interactive-accent] fo-text-[--text-on-accent] "
           : "fo-bg-[--background-primary] fo-text-[--text-muted] hover:fo-bg-[--background-modifier-hover]"
       }
      `}
    >
      {children}
    </button>
  );
}

function AssistantContent({
  plugin,
  leaf,
  initialTab,
  onTabChange,
}: {
  plugin: FileOrganizer;
  leaf: WorkspaceLeaf;
  initialTab: Tab;
  onTabChange: (setTab: (tab: Tab) => void) => void;
}) {
  const [activeTab, setActiveTab] = React.useState<Tab>(initialTab);

  React.useEffect(() => {
    onTabChange(setActiveTab);
  }, [onTabChange]);

  return (
    <div className="flex flex-col h-full ">
      <div className="flex  shadow-none w-fit space-x-2">
        <TabButton
          isActive={activeTab === "organizer"}
          onClick={() => setActiveTab("organizer")}
        >
          Organizer
        </TabButton>
        <TabButton
          isActive={activeTab === "inbox"}
          onClick={() => setActiveTab("inbox")}
        >
          Inbox
        </TabButton>
        <TabButton
          isActive={activeTab === "chat"}
          onClick={() => setActiveTab("chat")}
        >
          Chat
        </TabButton>
        <TabButton
          isActive={activeTab === "meetings"}
          onClick={() => setActiveTab("meetings")}
        >
          Meetings
        </TabButton>
      </div>

      <div className="pt-4 h-full">
        <TabContent activeTab={activeTab} plugin={plugin} leaf={leaf} />
      </div>
    </div>
  );
}

export class AssistantViewWrapper extends ItemView {
  root: Root | null = null;
  plugin: FileOrganizer;
  private activeTab: Tab = "organizer";
  private setActiveTab: (tab: Tab) => void = () => {};

  constructor(leaf: WorkspaceLeaf, plugin: FileOrganizer) {
    super(leaf);
    this.plugin = plugin;

    // Register commands
    this.plugin.addCommand({
      id: "open-organizer-tab",
      name: "Open Organizer Tab",
      callback: () => this.activateTab("organizer"),
    });

    this.plugin.addCommand({
      id: "open-inbox-tab",
      name: "Open Inbox Tab",
      callback: () => this.activateTab("inbox"),
    });

    this.plugin.addCommand({
      id: "open-chat-tab",
      name: "Open Chat Tab",
      callback: () => this.activateTab("chat"),
    });

    this.plugin.addCommand({
      id: "open-meetings-tab",
      name: "Open Meetings Tab",
      callback: () => this.activateTab("meetings"),
    });
  }

  activateTab(tab: Tab) {
    // Ensure view is open
    this.plugin.app.workspace.revealLeaf(this.leaf);

    // Update tab
    this.activeTab = tab;
    this.setActiveTab(tab);
  }

  getViewType(): string {
    return ORGANIZER_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Fo2k Assistant";
  }

  getIcon(): string {
    return "sparkle";
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.addClass('fo2k-view');
    this.root = createRoot(container);
    this.render();
  }

  render(): void {
    this.root?.render(
      <AppContext.Provider value={{ plugin: this.plugin, root: this.root }}>
        <React.StrictMode>
          <TooltipProvider>
            <AssistantContent
              plugin={this.plugin}
              leaf={this.leaf}
              initialTab={this.activeTab}
              onTabChange={setTab => {
                this.setActiveTab = setTab;
              }}
            />
          </TooltipProvider>
        </React.StrictMode>
      </AppContext.Provider>
    );
  }

  async onClose(): Promise<void> {
    this.containerEl.children[1].removeClass('fo2k-view');
    this.root?.unmount();
  }
}
