import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const DiscoveryTimer = ({ scheduledTime }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(scheduledTime) - new Date();
      if (diff <= 0) return "Starting Now";

      const parts = [];
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);

      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      parts.push(`${mins}m`);

      setTimeLeft(parts.join(" "));
    };

    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [scheduledTime]);

  return (
    <div className="flex items-center gap-2 text-brand-primary font-black animate-pulse">
      <Clock size={14} />
      {timeLeft}
    </div>
  );
};

export default DiscoveryTimer;
