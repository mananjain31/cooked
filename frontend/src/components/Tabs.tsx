import { useState } from "react";

interface Props {
  items: Array<{
    title: string;
    content: React.ReactNode;
  }>;
}

export default function Tabs({ items }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="relative">
      <header className="sticky top-0 bg-[#242424]">
        <ul className="inline-flex font-medium text-center  text-base border-b border-gray-700 border-default">
          {items.map((item, index) => (
            <li
              className={`
                ${
                  index === activeTab
                    ? " rounded-t-xl text-blue-500 bg-gray-800"
                    : "text-gray-300 hover:text-white"
                }
                cursor-pointer inline-block p-4 me-2 hover:bg-gray-800 hover:rounded-t-xl`}
              onClick={() => setActiveTab(index)}
            >
              {item.title}
            </li>
          ))}
        </ul>
      </header>
      <main>
        {items.map((item, index) =>
          index === activeTab ? (
            <>
              <div>{item.content}</div>
            </>
          ) : (
            <></>
          )
        )}
      </main>
    </div>
  );
}
