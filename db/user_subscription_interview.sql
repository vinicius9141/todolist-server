-- public.user_subscription_interview definition

-- Drop table

-- DROP TABLE public.user_subscription_interview;

CREATE TABLE public.user_subscription_interview (
	guid_candidate uuid NOT NULL,
	guid_interviewer uuid NOT NULL,
	interview_json json NULL,
	created_at timestamptz(0) NOT NULL DEFAULT now(),
	updated_at timestamptz(0) NOT NULL DEFAULT now(),
	status varchar NULL
);
CREATE UNIQUE INDEX user_subscription_interview_guid_candidate_idx ON public.user_subscription_interview USING btree (guid_candidate);


-- public.user_subscription_interview foreign keys

ALTER TABLE public.user_subscription_interview ADD CONSTRAINT user_subscription_interview_fk FOREIGN KEY (guid_candidate) REFERENCES user_system(guid);
ALTER TABLE public.user_subscription_interview ADD CONSTRAINT user_subscription_interview_fk_1 FOREIGN KEY (guid_interviewer) REFERENCES user_system(guid);