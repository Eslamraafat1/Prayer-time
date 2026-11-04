import { Stack } from "@mui/material";

type Props = {
  name: string;
  time: string;
  active?: boolean;
};

const Prayer = (props: Props) => {
  return (
    <div
      className={`preyer-card${props.active ? " active" : ""}`}
      aria-current={props.active ? "true" : undefined}
      style={{ marginBottom: "20px" }}
    >
      <Stack
        direction="row"
        style={{
          justifyContent: "space-between",
          padding: "15px",
          background: "var(--card-bg)",
          borderRadius: "10px",
          border: "1px solid var(--dark-gray)",
        }}
      >
        <h2 className="text">{props.name}</h2>
        <h2 className="time">{props.time}</h2>
      </Stack>
    </div>
  );
};

export default Prayer;
