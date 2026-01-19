export type SyncContact = {
  id: string;
  name: string;
  role: string;
  company?: string;
  bio?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
};

export const syncContacts: SyncContact[] = [
  {
    id: "helena-mata",
    name: "Helena Mata",
    role: "Licensing Manager",
    company: "EasySync",
    bio:
      "Com mais de 20 anos de experiência na indústria musical, com destaque para o licenciamento de música e projectos especiais, trabalhou em praticamente todas as editoras multinacionais em Portugal: Universal Music, EMI Music (actual Warner Music), BMG Music, CBS Music (actual Sony Music).",
    email: "helena.mata@easysync.pt",
    phone: "+351 910 501 910",
    // linkedin: "",
  },
];
