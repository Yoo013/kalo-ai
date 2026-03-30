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
import { FileText, Plus, Trash2 } from "lucide-react";
import PageHeader from "../components/shared/PageHeader";
import EmptyState from "../components/shared/EmptyState";

const STAGES = ["opening", "discovery", "presentation", "objection_handling", "closing", "follow_up"];

export default function Scripts() {
  const { user } = useOutletContext();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", stage: "opening", content: "" });

  const { data: scripts = [] } = useQuery({
    queryKey: ["scripts"],
    queryFn: () => base44.entities.Script.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Script.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scripts"] });
      setOpen(false);
      setForm({ name: "", stage: "opening", content: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Script.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["scripts"] }),
  });

  return (
    <div>
      <PageHeader title="Call Scripts" description="Configure talk tracks for each call stage">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Script</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New Script</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" placeholder="Script name" />
              </div>
              <div>
                <Label>Stage</Label>
                <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Script Content</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="mt-1 h-40" placeholder="Enter the talk track..." />
              </div>
              <Button onClick={() => createMutation.mutate(form)} className="w-full">Create Script</Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {scripts.length === 0 ? (
        <EmptyState icon={FileText} title="No scripts yet" description="Create call scripts for your agents" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scripts.map((script) => (
            <Card key={script.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">{script.name}</h3>
                  <Badge variant="secondary" className="text-[10px] mt-1 capitalize">{script.stage?.replace("_", " ")}</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMutation.mutate(script.id)}>
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">{script.content}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}