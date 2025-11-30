type Props = { color: 'green' | 'blue' | 'red' };

export const PulseIcon = ({ color }: Props) => {
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
  };

  const ringColorClasses = {
    green: 'bg-green-400',
    blue: 'bg-blue-400',
    red: 'bg-red-400',
  };

  return (
    <div className="relative flex h-5 w-5 items-center justify-center">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full ${ringColorClasses[color]} opacity-75`}
      />
      <span
        className={`relative inline-flex h-3 w-3 rounded-full ${colorClasses[color]}`}
      />
    </div>
  );
};
