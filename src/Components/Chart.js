import { Line } from "react-chartjs-2";

export const Chart = ({ chartData }) => {
  return (
    <div>
      <Line
        data={chartData}
        options={{
          animation: {
            duration: 1,
            },
          responsive: true,
          interaction: {
            mode: "index",
            intersect: false
          },
          stacked: false,
          aspectRatio: 6,

          plugins: {
            legend: false
          },

          scales: {
            y: {
              type: "linear",
              display: true,
              position: "left",
            },          
          }
        }}
      />
    </div>
  );
};
