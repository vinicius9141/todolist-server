-- public.v_0_user_subscription source

CREATE OR REPLACE VIEW public.v_0_user_subscription
AS SELECT us.guid,
    us.id_user,
    us.first_name,
    us.last_name,
    uss.id_profile,
    us.email,
    ( SELECT auh.status
           FROM activity_user_history auh
          WHERE auh.id_user = us.id_user AND auh.id_activity = '5adc6543-30f4-4ab3-b762-566b610e89d0'::uuid
          ORDER BY auh.date_created DESC
         LIMIT 1) AS multiple_choice,
    ( SELECT auh.status
           FROM activity_user_history auh
          WHERE auh.id_user = us.id_user AND auh.id_activity = 'a7bc93c7-b06c-4b5c-8dbc-4d1ab89e4ea3'::uuid
          ORDER BY auh.date_created DESC
         LIMIT 1) AS redaction,
    ( SELECT auh.status
           FROM activity_user_history auh
          WHERE auh.id_user = us.id_user AND auh.id_activity = 'aad14f4a-281c-4ecd-935e-1fad9a3b5606'::uuid
          ORDER BY auh.date_created DESC
         LIMIT 1) AS study_case,
    usss.case_study_score,
    usss.problem_resolution_score,
    ussf.rg,
    ussf.cpf,
    ussf.comp_residencia,
    ussf.comp_renda,
    ussf.cert_nascimento,
    ussf.rg_approval,
    ussf.cpf_approval,
    ussf.residencia_approval,
    ussf.renda_approval,
    ussf.nasc_approval
   FROM user_system us
     JOIN user_system_subscription uss ON uss.user_guid = us.guid
     LEFT JOIN user_system_subscription_scores usss ON usss.id_user = us.id_user
     LEFT JOIN user_system_subscription_files ussf ON ussf.id_user = us.id_user;