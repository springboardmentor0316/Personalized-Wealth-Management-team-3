import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { getGoal, getGoalProgress } from "../services/goals";
import formatApiError from "../utils/formatApiError";

export default function GoalDetails() {
  const { goalId } = useParams();
  const [goal, setGoal] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [goalData, progressData] = await Promise.all([getGoal(goalId), getGoalProgress(goalId)]);
        setGoal(goalData);
        setProgress(progressData);
      } catch (err) {
        setError(formatApiError(err, "Failed to load goal details"));
      }
    };
    load();
  }, [goalId]);

  return (
    <Layout>
      <section className="panel panel-narrow">
        <h1 className="panel-title">Goal Details</h1>
        <p className="top-gap">
          <Link to="/goals" className="form-link">
            Back to Goals
          </Link>
        </p>
        {error ? <p className="form-error">{error}</p> : null}
        {goal ? (
          <>
            <p className="panel-line">
              Name: <span className="value-text">{goal.name}</span>
            </p>
            <p className="panel-line">Target Amount: ${Number(goal.target_amount).toLocaleString()}</p>
            <p className="panel-line">Target Date: {goal.target_date}</p>
            <p className="panel-line">
              Monthly Contribution: ${Number(goal.monthly_contribution).toLocaleString()}
            </p>
            <p className="panel-line">Notes: {goal.notes || "No notes added"}</p>
            {progress ? (
              <>
                <div className="progress-wrap">
                  <div
                    className="progress-bar"
                    style={{ width: `${Math.min(100, progress.progress_percentage)}%` }}
                  />
                </div>
                <p className="muted-text">
                  Progress: {progress.progress_percentage.toFixed(2)}% (
                  ${Number(progress.estimated_contributed || 0).toLocaleString()} estimated)
                </p>
              </>
            ) : null}
          </>
        ) : null}
      </section>
    </Layout>
  );
}
