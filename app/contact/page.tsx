"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.email("Invalid email address"),
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    title: "",
    description: "",
  });
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactFormData, string>>
  >({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrors({});

    try {
      const validatedData = contactSchema.parse(formData);

      const response = await fetch("/api/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validatedData, website: honeypot }),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", title: "", description: "" });
      } else if (response.status === 429) {
        setStatus("ratelimit");
      } else {
        setStatus("error");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof ContactFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
        setStatus("");
      } else {
        setStatus("error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Submit an Inquiry</h1>
        <Link
          href={"/"}
          className="absolute top-4 left-4 text-sm sm:text-base md:text-lg lg:text-xl text-blue-400 focus:text-blue-500 hover:cursor-pointer hover:underline"
        >
          Back
        </Link>
        <p className="mb-6 text-gray-400">
          Report missing bus or train information, suggest improvements, or
          share your feedback about the departure board. Once approved, an issue
          will be automatically created in the{" "}
          <a 
            href="https://github.com/fetsare/foo-depart" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline hover:no-underline transition-colors"
          >
            GitHub repository
          </a>.
        </p>

        {status === "success" && (
          <div className="bg-green-900 border border-green-400 text-green-200 px-4 py-3 rounded mb-4">
            Inquiry submitted successfully! I will review it soon.
          </div>
        )}

        {status === "ratelimit" && (
          <div className="bg-yellow-900 border border-yellow-400 text-yellow-200 px-4 py-3 rounded mb-4">
            Too many submissions. Please try again later.
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-900 border border-red-400 text-red-200 px-4 py-3 rounded mb-4">
            Something went wrong. Please try again.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            style={{ position: "absolute", left: "-9999px" }}
            aria-hidden="true"
          >
            <label htmlFor="website">Leave this field empty</label>
            <input
              type="text"
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              required
              rows={6}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {status === "submitting" ? "Submitting..." : "Submit Inquiry"}
          </button>
        </form>
      </div>
    </div>
  );
}
