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
  const [message, setMessage] = useState<string>("");

  const handlePublish = () => {
    console.log(message);

    sendMessage(JSON.stringify({
      action: "msg",
      type: "cmd",
      body: {
        type: "lcdWrite",
        value: message
      }
    }))
  }

  /*
  THIS IS A GOOD AREA TO ADD WHAT IS BEING DISPLAYED CURRENTLY BACK TO WEBSITE FROM ESP
  */

  return (
    <div className="App">
      <h1>ESP32 Control Panel</h1>
      <div>
        <label 
          htmlFor="message" 
          className="block mb-2.5 text-sm font-medium text-heading"
          >
          Your message
        </label>

        <textarea 
          id="message" 
          rows={4} 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full p-3.5 shadow-xs placeholder:text-body" 
          placeholder="Write your thoughts here..."
        />
      </div>

      <div className="m-4">
        <button
          onClick={handlePublish}
          type="button"
          className="text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 shadow-md font-semibold leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none"
        >
          Send to Mich
        </button>
      </div>
    </div>
  );
}

export default App;
