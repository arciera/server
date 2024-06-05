type ChatComponent =
	| {
			bold?: boolean;
			italic?: boolean;
			underlined?: boolean;
			strikethrough?: boolean;
			obfuscated?: boolean;
			font?: string;
			color?: string;
			insertion?: string;
			clickEvent?: {
				action:
					| "open_url"
					| "open_file"
					| "run_command"
					| "suggest_command"
					| "change_page"
					| "copy_to_clipboard";
				value: string;
			};
			hoverEvent?: {
				action: "show_text" | "show_item" | "show_entity";
			};
			text?: string;
			extra?: [ChatComponent, ...ChatComponent[]];
	  }
	| { translate: string; with?: ChatComponent[] }
	| { keybind: string }
	| {
			score: {
				name: string;
				objective: string;
				value?: string;
			};
	  };
