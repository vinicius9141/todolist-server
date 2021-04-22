-- public.user_system_subscription_files definition

-- Drop table

-- DROP TABLE public.user_system_subscription_files;

CREATE TABLE public.user_system_subscription_files (
	id_user int4 NOT NULL,
	rg varchar NULL,
	cpf varchar NULL,
	comp_renda varchar NULL,
	comp_residencia varchar NULL,
	cert_nascimento varchar NULL,
	rg_approval bool NOT NULL DEFAULT false,
	cpf_approval bool NOT NULL DEFAULT false,
	renda_approval bool NOT NULL DEFAULT false,
	residencia_approval bool NOT NULL DEFAULT false,
	nasc_approval bool NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX user_system_subscription_files_id_user_idx ON public.user_system_subscription_files USING btree (id_user);


-- public.user_system_subscription_files foreign keys

ALTER TABLE public.user_system_subscription_files ADD CONSTRAINT user_system_subscription_files_fk FOREIGN KEY (id_user) REFERENCES user_system(id_user);