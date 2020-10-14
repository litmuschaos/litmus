import React from "react";
import LinearProgress from "@material-ui/core/LinearProgress";
const MIN = 100;
const MAX = 200;
const normalize = value => ((value - MIN) * 100) / (MAX - MIN);
export default function App() {
  const [progress, setProgress] = React.useState(MIN);
  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress(oldProgress => {
        if (oldProgress === MAX) {
          return 0;
        }
        return Math.min(oldProgress + 15, MAX);
      });
    }, 500);
  return () => {
      clearInterval(timer);
    };
  }, []);
  return (
    <div>
      <LinearProgress variant="determinate" value={normalize(progress)} />
    </div>
  );
}
