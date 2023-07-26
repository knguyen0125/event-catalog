import React from "react";
import { Owner } from "../../types";
import Avatar from "~/components/Avatar";
import { Link } from "@remix-run/react";

const OwnerCard: React.FC<{ owner: Owner }> = ({ owner }) => {
  return (
    <Link to={`./${owner.email}`} key={owner.email}>
      <div className="flex">
        <Avatar src={owner.image} alt={owner.name} />
        <div className={"ml-2 flex flex-col"}>
          <span className={"font-bold"}>
            {owner.name} - {owner.role}
          </span>
          <span>{owner.email}</span>
        </div>
      </div>
    </Link>
  );
};

export default OwnerCard;
