import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../../context/AppDataContext";
import { useToast } from "../../context/ToastContext";
import { TopBar, Screen } from "../../components/ui/AppShell";
import { TextInput, NumberInput, TextArea } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";

const bhaagidarSchema = z.object({
  name: z.string().min(1, "નામ જરૂરી છે"),
  mobile: z.string().optional(),
  sharePercentage: z.coerce.number().min(0, "0 થી 100 વચ્ચે હોવું જોઈએ").max(100, "0 થી 100 વચ્ચે હોવું જોઈએ"),
  notes: z.string().optional(),
});

type BhaagidarFormValues = z.infer<typeof bhaagidarSchema>;

export default function AddBhaagidar() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getSeason, addBhaagidar } = useAppData();
  const { show } = useToast();
  
  const season = getSeason(id!);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<BhaagidarFormValues>({
    resolver: zodResolver(bhaagidarSchema),
    defaultValues: {
      name: "",
      mobile: "",
      sharePercentage: 0,
      notes: "",
    },
  });

  if (!season) {
    return (
      <>
        <TopBar title="ભાગીદાર ઉમેરો" />
        <Screen withNav={false}>
          <p className="text-[var(--color-ink-faint)] pt-8 text-center">ખેતી મળી નથી.</p>
        </Screen>
      </>
    );
  }

  const onSubmit = (values: BhaagidarFormValues) => {
    addBhaagidar({ ...values, seasonId: season.id });
    show("ભાગીદાર ઉમેરાયો");
    navigate("/bhaagidar", { replace: true });
  };

  return (
    <>
      <TopBar title="નવો ભાગીદાર" />
      <Screen withNav={false}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-8">
          <TextInput
            label="નામ"
            required
            placeholder="દા.ત. રમેશભાઈ"
            error={errors.name?.message}
            {...register("name")}
          />
          
          <TextInput
            label="મોબાઈલ નંબર (વૈકલ્પિક)"
            type="tel"
            placeholder="દા.ત. 9876543210"
            error={errors.mobile?.message}
            {...register("mobile")}
          />

          <NumberInput
            label="ભાગ (Share %)"
            required
            placeholder="દા.ત. 25"
            step="0.01"
            min="0"
            max="100"
            error={errors.sharePercentage?.message}
            {...register("sharePercentage")}
          />

          <TextArea label="નોંધ (વૈકલ્પિક)" placeholder="શરતો અથવા અન્ય માહિતી" {...register("notes")} />

          <div className="pt-2">
            <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
              ભાગીદાર ઉમેરો
            </Button>
          </div>
        </form>
      </Screen>
    </>
  );
}
