import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import PageHeader from "../components/shared/PageHeader";
import EmptyState from "../components/shared/EmptyState";

const CATEGORIES = ["PRICE", "TRUST", "THINK_ABOUT_IT", "SPOUSE", "NOT_INTERESTED", "COMPETITOR"];
const categoryColors = {
  PRICE: "bg-emerald-500/10 text-emerald-600",
  TRUST: "bg-primary/10 text-primary",
  THINK_ABOUT_IT: "bg-amber-500/10 text-amber-600",
  SPOUSE: "bg-muted text-muted-foreground",
  NOT_INTERESTED: "bg-destructive/10 text-destructive",
  COMPETITOR: "bg-accent text-accent-foreground",
};

export default function Objections() {
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: "PRICE", suggested_response: "", trigger_phrases: "" });

  const { data: objections = [] } = useQuery({
    queryKey: ["objections"],
    queryFn: () => base44.entities.Objection.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Objection.create({
      ...data,
      trigger_phrases: data.trigger_phrases.split(",").map((s) => s.trim()).filter(Boolean),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objections"] });
      setOpen(false);
      setForm({ category: "PRICE", suggested_response: "", trigger_phrases: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Objection.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["objections"] }),
  });

  return (
    <div>
      <PageHeader title="Objection Responses" description="Configure how the AI responds to common objections">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Response</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Objection Response</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Trigger Phrases (comma-separated)</Label>
                <Input value={form.trigger_phrases} onChange={(e) => setForm({ ...form, trigger_phrases: e.target.value })} className="mt-1" placeholder="too expensive, can't afford, costs too much" />
              </div>
              <div>
                <Label>Suggested Response</Label>
                <Textarea value={form.suggested_response} onChange={(e) => setForm({ ...form, suggested_response: e.target.value })} className="mt-1 h-32" placeholder="Enter the suggested agent response..." />
              </div>
              <Button onClick={() => createMutation.mutate(form)} className="w-full">Save Response</Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {objections.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No objection responses" description="Add objection responses to train the AI coach" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {objections.map((obj) => (
            <Card key={obj.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <Badge className={`text-[10px] ${categoryColors[obj.category] || "bg-muted text-muted-foreground"}`}>
                  {obj.category?.replace(/_/g, " ")}
                </Badge>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMutation.mutate(obj.id)}>
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </div>
              {obj.trigger_phrases?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {obj.trigger_phrases.map((phrase, i) => (
                    <span key={i} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{phrase}</span>
                  ))}
                </div>
              )}
              <p className="text-sm text-muted-foreground">{obj.suggested_response}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}