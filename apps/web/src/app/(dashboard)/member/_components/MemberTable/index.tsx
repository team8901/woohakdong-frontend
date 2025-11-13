type Props = {
  members: unknown[];
};

export const MemberTable = ({ members }: Props) => {
  // TODO: UI 구현
  return (
    <>
      {members.map((member) => (
        <>row {member}</>
      ))}
    </>
  );
};
