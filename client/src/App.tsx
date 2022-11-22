import React from "react";

interface MessagePayload {
  readonly identifier: string;
  readonly message: string;
  readonly isOwnMessages: boolean;
}

function useMessageSync(): [Array<MessagePayload>, (message: string) => void] {
  const [ws] = React.useState(() => new WebSocket("ws://localhost:40510"));
  const [messages, setMessages] = React.useState<Array<MessagePayload>>([]);
  const [identifier, setIdentifier] = React.useState(null);

  const sendMessage = React.useCallback(
    (message) => {
      ws.send(message);
    },
    [ws]
  );

  React.useEffect(() => {
    ws.onopen = function (ev) {
      console.log("websocket is connected ...", ev);
    };

    ws.onmessage = function (ev) {
      console.log(ev);
      const [type, messageIdentifier, message]: Array<string> =
        ev.data.split("::");

      console.log(messageIdentifier, identifier);

      switch (type) {
        case "OPEN": {
          setIdentifier(messageIdentifier);
          break;
        }
        case "MESSAGE": {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              identifier: messageIdentifier,
              message,
              isOwnMessages: identifier === messageIdentifier,
            },
          ]);
          break;
        }
        default: {
          console.log("Incorrect type!", type);
          break;
        }
      }
    };
  }, [ws, identifier]);

  return [messages, sendMessage];
}

export const App: React.FC = () => {
  const [messages, sendMessage] = useMessageSync();
  const [inputValue, setInputValue] = React.useState("");
  const scrollRef = React.useRef(null);

  const onInputChange = React.useCallback(
    (e) => {
      setInputValue(e.target.value);
    },
    [setInputValue]
  );

  const scrollToBottom = React.useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleSendMessage = React.useCallback(
    (e) => {
      e.preventDefault();
      sendMessage(inputValue);
      setInputValue("");
    },
    [sendMessage, inputValue, scrollToBottom]
  );

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "98vh",
          maxHeight: "98vh",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            gridGap: "5px",
            maxHeight: "96vh",
            overflow: "scroll",
          }}
        >
          {messages.map(({ message, isOwnMessages }, index) => (
            <div
              style={{
                display: "flex",
                alignSelf: isOwnMessages ? "flex-end" : "flex-start",
                backgroundColor: isOwnMessages ? "blue" : "grey",
                padding: "10px",
                borderRadius: "10px",
              }}
              key={index}
            >
              <span style={{ color: isOwnMessages ? "white" : "black" }}>
                {message}
              </span>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
        <form style={{ display: "flex" }} onSubmit={handleSendMessage}>
          <input
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "15px",
              border: "1px solid #8080805e",
            }}
            placeholder="Start a new message"
            value={inputValue}
            onChange={onInputChange}
          />
          <div style={{ display: "none" }}>
            <button type="submit">Send</button>
          </div>
        </form>
      </div>
    </div>
  );
};
