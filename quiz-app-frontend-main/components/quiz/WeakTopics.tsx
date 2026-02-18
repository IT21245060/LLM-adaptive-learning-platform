import React from "react";

const WeakTopics = ({ topics }: { topics: string[] }) => {
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <h3 className="text-lg font-semibold mt-8">You were weak at the following topics</h3>
      <div className="mt-3">
        <ul>
          {topics &&
            topics.map((topic, i) => {
              return (
                <li className="list-disc" key={i}>
                  {topic}
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
};

export default WeakTopics;
