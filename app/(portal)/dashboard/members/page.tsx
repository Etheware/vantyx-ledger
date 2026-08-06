"use client";

import React, { useState } from "react";

export const dynamic = "force-dynamic";

interface TeamMember {
  id: string;
  email: string;
  role: "owner" | "admin" | "billing" | "member" | "viewer";
  status: "active" | "invited" | "disabled";
  joinedAt: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "1",
      email: "owner@acme.com",
      role: "owner",
      status: "active",
      joinedAt: "2024-01-15",
    },
    {
      id: "2",
      email: "billing@acme.com",
      role: "billing",
      status: "active",
      joinedAt: "2024-02-20",
    },
  ]);

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  const handleInvite = async () => {
    if (!inviteEmail) return;

    try {
      const response = await fetch("/api/members/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      if (response.ok) {
        setMembers((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            email: inviteEmail,
            role: inviteRole as TeamMember["role"],
            status: "invited",
            joinedAt: new Date().toISOString().split("T")[0],
          },
        ]);
        setInviteEmail("");
        setShowInvite(false);
      }
    } catch (error) {
      console.error("Failed to invite member:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Team Members</h1>
        <p className="text-slate-600">Manage who has access to your account</p>
      </div>

      {showInvite ? (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Invite Member</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="member@example.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="billing">Billing</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowInvite(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowInvite(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          + Invite Member
        </button>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Members</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900">{member.email}</td>
                  <td className="px-4 py-3 text-sm capitalize text-slate-700">
                    {member.role}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <StatusBadge status={member.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {member.joinedAt}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button className="text-slate-600 hover:text-red-600 transition">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TeamMember["status"] }) {
  const colors = {
    active: "bg-green-100 text-green-800",
    invited: "bg-yellow-100 text-yellow-800",
    disabled: "bg-slate-100 text-slate-800",
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${colors[status]}`}>
      {status}
    </span>
  );
}
