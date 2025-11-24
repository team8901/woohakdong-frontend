export const NoticeHeader = () => {
  return (
    <div className="space-y-6">
      <div className="hidden flex-col md:flex">
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">
          공지사항
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          중요한 공지사항과 새로운 소식을 확인해보세요
        </p>
      </div>
    </div>
  );
};
