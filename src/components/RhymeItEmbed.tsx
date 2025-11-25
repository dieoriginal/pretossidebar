"use client";

import React from "react";

const RhymeItEmbed: React.FC = () => (
  <iframe
    src="https://www.rhymit.com/"
    style={{ width: "90%", height: "90%", border: "1px solid #ccc", borderRadius: "16px", minHeight: "90vh", marginRight: "auto", marginLeft: "auto" }}
    loading="eager"
    referrerPolicy="no-referrer-when-downgrade"
    title="Rhymit Embed"
  />
);

export default RhymeItEmbed;

 