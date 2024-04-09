import React, { useState, useEffect } from "react";
import { Octokit } from "@octokit/rest";
import "./index.css";

const octokit = new Octokit();

export default function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [repos, setRepos] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [username] = useState("");

  useEffect(() => {
    const fetchPublicRepos = async () => {
      try {
        const response = await octokit.repos.listPublicForUser({
          username: username,
        });
        setRepos(response.data);
      } catch (error) {
        console.error("Error fetching public repositories:", error);
      }
    };

    fetchPublicRepos();
  }, [username]);

  const handleLoadTasks = async (repo) => {
    try {
      const response = await fetch(`https://api.github.com/repos/${repo.full_name}/issues`);
      const data = await response.json();
      const formattedTasks = data.map((issue) => ({
        id: issue.id,
        title: issue.title,
        status: issue.state === "open" ? "ToDo" : "Done",
      }));
      setTasks(formattedTasks);
    } catch (error) {
      console.error("Error loading issues:", error);
    }
  };

  const handleLoadRepo = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${repoUrl}/issues`);
      const data = await response.json();
      const formattedTasks = data.map((issue) => ({
        id: issue.id,
        title: issue.title,
        status: issue.state === "open" ? "ToDo" : "Done",
      }));
      setTasks(formattedTasks);
    } catch (error) {
      setError("Error loading issues. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <label>
        Repo URL:
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
        />
      </label>
      <button onClick={handleLoadRepo} disabled={loading}>
        {loading ? "Loading..." : "Load"}
      </button>
      {error && <div className="error">{error}</div>}
      <h1></h1>
      <ul>
        {repos.map((repo) => (
          <li key={repo.id}>
            {repo.name}
            <button onClick={() => handleLoadTasks(repo)}>Load Tasks</button>
          </li>
        ))}
      </ul>
      <h2>Tasks</h2>
      <div className="columns">
        <div className="column">
          <h3>ToDo</h3>
          {tasks
            .filter((task) => task.status === "ToDo")
            .map((task) => (
              <div key={task.id}>{task.title}</div>
            ))}
        </div>
        <div className="column">
          <h3>InProgress</h3>
          {tasks
            .filter((task) => task.status === "InProgress")
            .map((task) => (
              <div key={task.id}>{task.title}</div>
            ))}
        </div>
        <div className="column">
          <h3>Done</h3>
          {tasks
            .filter((task) => task.status === "Done")
            .map((task) => (
              <div key={task.id}>{task.title}</div>
            ))}
        </div>
      </div>
    </div>
  );
}
