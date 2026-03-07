"use client";

import { ChangeEvent, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { websiteApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

type SectionState = {
  title: string;
  bodyText: string;
  image: File | null;
};

type ContactState = {
  address: string;
  phoneNumber: string;
  email: string;
};

const resolveText = (value?: string) => value?.trim() || "";

export default function WebsitePage() {
  const [hero, setHero] = useState<SectionState>({
    title: "",
    bodyText: "",
    image: null,
  });
  const [about, setAbout] = useState<SectionState>({
    title: "",
    bodyText: "",
    image: null,
  });
  const [creative, setCreative] = useState<SectionState>({
    title: "",
    bodyText: "",
    image: null,
  });
  const [client, setClient] = useState<SectionState>({
    title: "",
    bodyText: "",
    image: null,
  });
  const [contact, setContact] = useState<ContactState>({
    address: "",
    phoneNumber: "",
    email: "",
  });
  const [creativeImages, setCreativeImages] = useState<File[]>([]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["website-sections"],
    queryFn: async () => {
      const [heroSection, aboutSection, creativeSection, clientSection, contactSection] = await Promise.all([
        websiteApi.getHeroSection(),
        websiteApi.getAboutSection(),
        websiteApi.getCreativeSection(),
        websiteApi.getClientSection(),
        websiteApi.getContactSection(),
      ]);

      return {
        hero: heroSection,
        about: aboutSection,
        creative: creativeSection,
        client: clientSection,
        contact: contactSection,
      };
    },
  });

  const heroMutation = useMutation({
    mutationFn: async () => {
      const title = resolveText(hero.title) || resolveText(data?.hero?.title);
      const bodyText =
        resolveText(hero.bodyText) || resolveText(data?.hero?.bodyText);

      if (!title || !bodyText) {
        throw new Error("Hero title and body text are required");
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("bodyText", bodyText);
      if (hero.image) formData.append("image", hero.image);

      await websiteApi.saveHero(formData);
    },
    onSuccess: async () => {
      toast.success("Hero section updated");
      setHero((prev) => ({ ...prev, image: null }));
      await refetch();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const removeHeroImageMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("removeImage", "true");
      await websiteApi.updateHero(formData);
    },
    onSuccess: async () => {
      toast.success("Hero image removed");
      await refetch();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const aboutMutation = useMutation({
    mutationFn: async () => {
      const title = resolveText(about.title) || resolveText(data?.about?.title);
      const bodyText =
        resolveText(about.bodyText) || resolveText(data?.about?.bodyText);

      if (!title || !bodyText) {
        throw new Error("About title and body text are required");
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("bodyText", bodyText);
      if (about.image) formData.append("image", about.image);

      await websiteApi.saveAbout(formData);
    },
    onSuccess: async () => {
      toast.success("About section updated");
      setAbout((prev) => ({ ...prev, image: null }));
      await refetch();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const removeAboutImageMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("removeImage", "true");
      await websiteApi.updateAbout(formData);
    },
    onSuccess: async () => {
      toast.success("About image removed");
      await refetch();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const creativeMutation = useMutation({
    mutationFn: async () => {
      const title =
        resolveText(creative.title) || resolveText(data?.creative?.title);
      const bodyText =
        resolveText(creative.bodyText) || resolveText(data?.creative?.bodyText);

      if (!title || !bodyText) {
        throw new Error("Creative title and body text are required");
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("bodyText", bodyText);
      if (creative.image) formData.append("heroImage", creative.image);
      creativeImages.forEach((image) => formData.append("images", image));

      await websiteApi.saveCreative(formData);
    },
    onSuccess: async () => {
      toast.success("Creative section updated");
      setCreative((prev) => ({ ...prev, image: null }));
      setCreativeImages([]);
      await refetch();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const removeCreativeHeroImageMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("removeHeroImage", "true");
      await websiteApi.updateCreative(formData);
    },
    onSuccess: async () => {
      toast.success("Creative hero image removed");
      await refetch();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const removeCreativeGalleryImageMutation = useMutation({
    mutationFn: async (publicId: string) => {
      const formData = new FormData();
      formData.append("removeImagePublicIds", JSON.stringify([publicId]));
      await websiteApi.updateCreative(formData);
    },
    onSuccess: async () => {
      toast.success("Creative image removed");
      await refetch();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const clientMutation = useMutation({
    mutationFn: async () => {
      const title = resolveText(client.title) || resolveText(data?.client?.title);
      const bodyText =
        resolveText(client.bodyText) || resolveText(data?.client?.bodyText);

      if (!title || !bodyText) {
        throw new Error("Client title and body text are required");
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("bodyText", bodyText);
      if (client.image) formData.append("image", client.image);

      await websiteApi.saveClient(formData);
    },
    onSuccess: async () => {
      toast.success("Client section updated");
      setClient((prev) => ({ ...prev, image: null }));
      await refetch();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const removeClientImageMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("removeImage", "true");
      await websiteApi.updateClient(formData);
    },
    onSuccess: async () => {
      toast.success("Client image removed");
      await refetch();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const contactMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        address:
          resolveText(contact.address) || resolveText(data?.contact?.address),
        phoneNumber:
          resolveText(contact.phoneNumber) ||
          resolveText(data?.contact?.phoneNumber),
        email: resolveText(contact.email) || resolveText(data?.contact?.email),
      };

      if (!payload.address || !payload.phoneNumber || !payload.email) {
        throw new Error("Address, phone number, and email are required");
      }

      await websiteApi.saveContact(payload);
    },
    onSuccess: async () => {
      toast.success("Contact section updated");
      await refetch();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <div>
      <Card>
        <CardContent className="p-4 lg:p-6">
          <PageHeader
            title="Manage website"
            breadcrumbs={["Dashboard", "Manage Website"]}
          />

          {isLoading ? (
            <Skeleton className="h-[900px] w-full" />
          ) : (
            <div className="space-y-5">
              <WebsiteSection
                title="Hero section"
                state={hero}
                setState={setHero}
                currentTitle={data?.hero?.title}
                currentBody={data?.hero?.bodyText}
                currentImageUrl={data?.hero?.image?.url}
                onRemoveCurrentImage={() => removeHeroImageMutation.mutate()}
                removingImage={removeHeroImageMutation.isPending}
                onSave={() => heroMutation.mutate()}
                saving={heroMutation.isPending}
                saveLabel="Update Hero"
              />

              <WebsiteSection
                title="About us"
                state={about}
                setState={setAbout}
                currentTitle={data?.about?.title}
                currentBody={data?.about?.bodyText}
                currentImageUrl={data?.about?.image?.url}
                onRemoveCurrentImage={() => removeAboutImageMutation.mutate()}
                removingImage={removeAboutImageMutation.isPending}
                onSave={() => aboutMutation.mutate()}
                saving={aboutMutation.isPending}
                saveLabel="Update About"
              />

              <WebsiteSection
                title="Creative"
                state={creative}
                setState={setCreative}
                currentTitle={data?.creative?.title}
                currentBody={data?.creative?.bodyText}
                currentImageUrl={data?.creative?.heroImage?.url}
                onRemoveCurrentImage={() =>
                  removeCreativeHeroImageMutation.mutate()
                }
                removingImage={removeCreativeHeroImageMutation.isPending}
                currentGalleryImages={data?.creative?.images}
                onRemoveGalleryImage={(publicId) =>
                  removeCreativeGalleryImageMutation.mutate(publicId)
                }
                removingGalleryImage={removeCreativeGalleryImageMutation.isPending}
                onMultiImage={setCreativeImages}
                onSave={() => creativeMutation.mutate()}
                saving={creativeMutation.isPending}
                saveLabel="Update Creative"
              />

              <WebsiteSection
                title="Client"
                state={client}
                setState={setClient}
                currentTitle={data?.client?.title}
                currentBody={data?.client?.bodyText}
                currentImageUrl={data?.client?.image?.url}
                onRemoveCurrentImage={() => removeClientImageMutation.mutate()}
                removingImage={removeClientImageMutation.isPending}
                onSave={() => clientMutation.mutate()}
                saving={clientMutation.isPending}
                saveLabel="Update Client"
              />

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="mb-2 text-lg font-semibold">Contact</p>
                <div className="space-y-3">
                  <Field
                    label="Address"
                    value={contact.address}
                    placeholder={data?.contact?.address || "Address"}
                    onChange={(value) =>
                      setContact((prev) => ({ ...prev, address: value }))
                    }
                  />
                  <Field
                    label="Phone number"
                    value={contact.phoneNumber}
                    placeholder={data?.contact?.phoneNumber || "+555"}
                    onChange={(value) =>
                      setContact((prev) => ({ ...prev, phoneNumber: value }))
                    }
                  />
                  <Field
                    label="Email"
                    value={contact.email}
                    placeholder={data?.contact?.email || "you@gmail.com"}
                    onChange={(value) =>
                      setContact((prev) => ({ ...prev, email: value }))
                    }
                  />
                  <div className="pt-2">
                    <Button
                      type="button"
                      onClick={() => contactMutation.mutate()}
                      disabled={contactMutation.isPending}
                    >
                      {contactMutation.isPending
                        ? "Updating..."
                        : "Update Contact"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function WebsiteSection({
  title,
  state,
  setState,
  currentTitle,
  currentBody,
  onMultiImage,
  currentImageUrl,
  onRemoveCurrentImage,
  removingImage,
  currentGalleryImages,
  onRemoveGalleryImage,
  removingGalleryImage,
  onSave,
  saving,
  saveLabel,
}: {
  title: string;
  state: SectionState;
  setState: (state: SectionState) => void;
  currentTitle?: string;
  currentBody?: string;
  onMultiImage?: (files: File[]) => void;
  currentImageUrl?: string;
  onRemoveCurrentImage?: () => void;
  removingImage?: boolean;
  currentGalleryImages?: Array<{ public_id?: string; url?: string }>;
  onRemoveGalleryImage?: (publicId: string) => void;
  removingGalleryImage?: boolean;
  onSave: () => void;
  saving?: boolean;
  saveLabel: string;
}) {
  const onSelectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setState({ ...state, image: file });
  };

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="mb-2 text-lg font-semibold">{title}</p>
      <div className="space-y-3">
        <Field
          label="Title"
          value={state.title}
          placeholder={currentTitle || "Title"}
          onChange={(value) => setState({ ...state, title: value })}
        />
        <div>
          <p className="mb-1 text-base font-medium">Body text</p>
          <Textarea
            value={state.bodyText}
            placeholder={currentBody || "Body text"}
            onChange={(event) =>
              setState({ ...state, bodyText: event.target.value })
            }
            className="min-h-20"
          />
        </div>
        <label className="block rounded-xl border border-dashed border-slate-300 p-6 text-center">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onSelectImage}
          />
          <ImageIcon className="mx-auto h-8 w-8 text-slate-400" />
          <p className="my-2 text-slate-500">
            {state.image ? state.image.name : "Upload Photo"}
          </p>
          <Button type="button">Upload Photo</Button>
        </label>

        {currentImageUrl ? (
          <div className="relative w-fit rounded-xl border border-slate-200 p-2">
            <img
              src={currentImageUrl}
              alt={`${title} image`}
              className="h-28 w-28 rounded-lg object-cover"
            />
            {onRemoveCurrentImage ? (
              <button
                type="button"
                className="absolute -right-2 -top-2 rounded-full bg-black p-1 text-white hover:bg-black/80"
                onClick={onRemoveCurrentImage}
                disabled={removingImage}
              >
                <X className="h-3 w-3" />
              </button>
            ) : null}
          </div>
        ) : null}

        {onMultiImage ? (
          <label className="block rounded-xl border border-dashed border-slate-300 p-6 text-center">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={(event) =>
                onMultiImage(Array.from(event.target.files || []))
              }
            />
            <p className="text-slate-500">Upload additional creative images</p>
          </label>
        ) : null}

        {currentGalleryImages?.length ? (
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Existing Creative Images
            </p>
            <div className="flex flex-wrap gap-3">
              {currentGalleryImages
                .filter((image) => image.url)
                .map((image) => {
                  const publicId = image.public_id;

                  return (
                    <div
                      key={publicId || image.url}
                      className="relative rounded-xl border border-slate-200 p-2"
                    >
                      <img
                        src={image.url}
                        alt="Creative gallery"
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                      {publicId && onRemoveGalleryImage ? (
                        <button
                          type="button"
                          className="absolute -right-2 -top-2 rounded-full bg-black p-1 text-white hover:bg-black/80"
                          onClick={() => onRemoveGalleryImage(publicId)}
                          disabled={removingGalleryImage}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      ) : null}
                    </div>
                  );
                })}
            </div>
          </div>
        ) : null}

        <div className="pt-2">
          <Button type="button" onClick={onSave} disabled={saving}>
            {saving ? "Updating..." : saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-base font-medium">{label}</p>
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12"
      />
    </div>
  );
}
