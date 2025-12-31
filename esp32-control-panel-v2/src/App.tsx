import { useEffect, useState } from "react";
import "./App.css";
import useWebSocket from "react-use-websocket";

type MessageBody = {
  action: string
  type: string
  body: any
}
const outputPins = [18,19,22,23]; 
const defaultOutputPin = outputPins[0];

function App() {
  const { lastMessage, sendMessage, readyState } = useWebSocket(
    "wss://y3txhbyqo6.execute-api.us-west-1.amazonaws.com/dev"
  );

  const [selectedPin, setSelectedPin] = useState(defaultOutputPin);
  const [pinValue, setPinValue] = useState(false);

  useEffect(() => {
    if (lastMessage === null) {
      return;
    }
    
    const parsedMessage = JSON.parse(lastMessage.data) as MessageBody;

    if (parsedMessage.action !== "msg") {
      return;
    }

    if (parsedMessage.type === "output") {
      const body = parsedMessage.body as number;

      setPinValue(body === 0 ? false : true);
    }
  }, [lastMessage, setPinValue])

  useEffect(() => {
    if (readyState !== 1) return;

    sendMessage(JSON.stringify({
      action: "msg",
      type: "cmd",
      body: {
        type: "digitalRead",
        pin: defaultOutputPin,
      }
    }));

    outputPins.forEach((pin) => {
      sendMessage(JSON.stringify({
        action: "msg",
        type: "cmd",
        body: {
          type: "pinMode",
          pin,
          mode: "output"
        }
      }))
    })
  }, [readyState, sendMessage]);

  return (
    <div className="App">
      <h1>ESP32 Control Panel</h1>
      <div>
        <form className="max-w-sm mx-auto">
        <label htmlFor="countries" className="block mb-2 text-sm font-medium text-heading">Select an Pin</label>
        <select 
          value={selectedPin}
          onChange={(e) => {
            const newPin = parseInt(e.target.value, 10);
            setSelectedPin(newPin);

            sendMessage(JSON.stringify({
              action: "msg",
              type: "cmd",
              body: {
                type: "digitalRead",
                pin: newPin,
              }
            }));
          }}
          className="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body">
          {outputPins.map((pin) => (
            <option key={pin} value={pin}>GPIO{pin}</option>
            ))}
        </select>
      </form>
      </div>
      <div className="m-4">
        <label className="inline-flex items-center cursor-pointer gap-3">
          <input type="checkbox" 
            checked={pinValue}
            onChange={() => {
              const newValue = !pinValue;
              setPinValue(newValue);

              sendMessage(JSON.stringify({
                action: "msg",
                type: "cmd",
                body: {
                  type: "digitalWrite",
                  pin: selectedPin,
                  value: newValue ? 1 : 0,
                }
              }))
            }}
            className="sr-only peer"/>
          <div className="relative w-9 h-5 bg-neutral-quaternary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-soft dark:peer-focus:ring-brand-soft rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-buffer after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
          <span className="select-none text-sm font-medium text-heading">
            {pinValue ? "On" : "Off"}
          </span>
        </label>
      </div>
    </div>
  );
}

export default App;
