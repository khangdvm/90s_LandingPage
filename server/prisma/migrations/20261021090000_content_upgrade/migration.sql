ALTER TABLE "Room" ADD COLUMN "gallery" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "News" ADD COLUMN "contentDoc" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "ContentCard" ADD COLUMN "menuItems" JSONB NOT NULL DEFAULT '[]';
UPDATE "ContentCard" SET "menuItems" = COALESCE((SELECT jsonb_agg(jsonb_build_object('name',name,'price',NULL,'unit','','description','','imageUrl','','isActive',true,'sortOrder',ord-1) ORDER BY ord) FROM unnest("dishes") WITH ORDINALITY AS d(name,ord)), '[]'::jsonb);
