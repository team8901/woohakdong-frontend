type Props = {
  label: string;
  value: number;
  icon: React.ReactNode;
};

export const StatsCard = ({ label, value, icon }: Props) => {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm sm:p-6">
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900">
          {value.toLocaleString()}
        </p>
      </div>
      <div className="flex items-center justify-center">{icon}</div>
    </div>
  );
};
