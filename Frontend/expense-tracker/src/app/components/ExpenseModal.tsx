"use client";
import { useState, useEffect } from "react";

interface ExpenseModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function ExpenseModal({ isOpen, setIsOpen }: ExpenseModalProps) {
  const [description, setDescription] = useState("");
  const [participants, setParticipants] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [date, setDate] = useState("");
  const [splitDetails, setSplitDetails] = useState<{ name: string; amount: number }[]>([]);
  const [splitEqually, setSplitEqually] = useState(false);
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [setIsOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const splitEqualAmount = (parseFloat(totalAmount) / participants.split(",").length).toFixed(2);
    const calculatedSplitDetails = splitEqually
      ? participants.split(",").map((participant) => ({ name: participant.trim(), amount: splitEqualAmount }))
      : splitDetails;

    const expenseData = {
      description,
      paidBy: "Newton",
      totalAmount: parseFloat(totalAmount),
      participants: participants.split(",").map((participant) => ({
        name: participant.trim(),
      })),
      date,
      splitDetails: calculatedSplitDetails
    };

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Expense added successfully!");
        setIsOpen(false);
      } else {
        alert(result.error || "Failed to add expense.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    }
  };

  const handleSplitAmountChange = (participant: string, amount: string) => {
    setSplitDetails((prev) => {
      const existingParticipantIndex = prev.findIndex((split) => split.name === participant);
      const roundedAmount = parseFloat(amount).toFixed(2);
      if (existingParticipantIndex !== -1) {
        const updatedSplitDetails = [...prev];
        updatedSplitDetails[existingParticipantIndex].amount = parseFloat(roundedAmount);
        return updatedSplitDetails;
      } else {
        return [...prev, { name: participant, amount: parseFloat(roundedAmount) }];
      }
    });
  };
  
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-96 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-black">Add New Expense</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Expense Description*"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 rounded-md focus:ring-2 focus:ring-[#BC8D0B] outline-none text-black"
          />
          <input
            type="text"
            placeholder="Participants* (comma separated)"
            required
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            className="border p-2 rounded-md focus:ring-2 focus:ring-[#BC8D0B] outline-none text-black"
          />
          <input
            type="number"
            placeholder="Amount*"
            required
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            className="border p-2 rounded-md focus:ring-2 focus:ring-[#BC8D0B] outline-none text-black"
          />
          <input
            type="date"
            value={date || "-"}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded-md focus:ring-2 focus:ring-[#BC8D0B] outline-none text-gray-400"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={splitEqually}
              onChange={(e) => setSplitEqually(e.target.checked)}
              className="w-4 h-4"
            />
            <label className="text-black">Split Equally</label>
          </div>

          {!splitEqually && (
            <div>
              <h3 className="font-medium text-black">Split Amounts:</h3>
              {participants.split(",").map((participant, idx) => (
                <div key={idx} className="flex gap-2">
                  <label className="text-sm">{participant.trim()}</label>
                  <input
                    type="number"
                    placeholder="Amount"
                    onChange={(e) => handleSplitAmountChange(participant.trim(), e.target.value)}
                    className="border p-2 rounded-md focus:ring-2 focus:ring-[#BC8D0B] outline-none text-black"
                  />
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            className="bg-[#BC8D0B] text-white py-2 rounded-lg hover:bg-[#8E6B09] transition"
          >
            Add Expense
          </button>
        </form>
      </div>
    </div>
  );
}
