type Props = {
  // TODO: 타입 변경
  members: string[];
};

export const MemberTable = ({ members }: Props) => {
  // TODO: UI 구현
  return (
    <>
      {members.map((member) => (
        <div key={member}>row {member}</div>
      ))}
    </>
  );
};
