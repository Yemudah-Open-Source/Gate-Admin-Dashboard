import { useEffect, useState } from "react";

// Define the session type
interface Session {
  session_id: string;
  page: string;
}

interface SSEEvent {
  type: string;
  message: string;
}

export default function Dashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    // Establish an SSE connection to the backend
    const eventSource = new EventSource("http://localhost:8080/sse");

    // Listen for messages from the backend
    eventSource.onmessage = (event) => {
      console.log("Received update:", event.data);

      // Parse the data correctly as a JSON object
      const update: SSEEvent = JSON.parse(event.data);

      // Handle different event types
      if (update.type === "session_update") {
        const updateData = update.message.split(" - ");
        const session_id = updateData[0].split(": ")[1];
        const page = updateData[1].split(": ")[1];

        setSessions((prevSessions) => {
          // Update the sessions array with the new session data
          const updatedSessions = prevSessions.filter(
            (session) => session.session_id !== session_id
          );
          return [...updatedSessions, { session_id, page }];
        });
      } else if (update.type === "session_timeout") {
        const session_id = update.message.split(": ")[1];

        setSessions((prevSessions) =>
          prevSessions.filter((session) => session.session_id !== session_id)
        );
      }
    };

    // Clean up the SSE connection when the component unmounts
    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Active Sessions</h1>
      {sessions.length === 0 ? (
        <p>No active sessions</p>
      ) : (
        <table className="table-auto w-full border">
          <thead>
            <tr className="border">
              <th className="p-2 border">Session ID</th>
              <th className="p-2 border">Active Page</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.session_id} className="border">
                <td className="p-2 border">{session.session_id}</td>
                <td className="p-2 border">{session.page}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
