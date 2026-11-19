# Reuse-first engineering policy

**Status:** Product and engineering decision  
**Applies to:** Ritewheel Autos web application and future services

## Principle

Ritewheel should not rebuild a solved problem just to own every line of code. Before designing a new UI, interaction, workflow, or service, search for a maintained public project, library, or component that already solves most of the requirement. Prefer integrating and adapting a proven component over copying a whole application or creating a new subsystem.

Ritewheel-specific work should focus on the parts that are genuinely unique: its vehicle catalogue, dealership rules, data integrity, customer consent, brand experience, and integrations.

## Reuse checklist

Before adopting a candidate, record:

1. **Fit:** Does it perform the required user job, not merely look similar?
2. **License:** Confirm the source-code license and the separate licenses for images, models, fonts, datasets and other assets. No explicit license means read-only research; do not copy or redistribute its code.
3. **Health:** Check recent maintenance, releases, issues, security advisories, community activity and whether the project is archived.
4. **Compatibility:** Check React/Next.js versions, runtime assumptions, dependency size, SSR/browser requirements and the existing Ritewheel stack.
5. **Security and cost:** Review upload validation, authentication, rate limits, secrets, data handling, provider calls and likely usage costs. Never copy credentials or unsafe API routes.
6. **Integration boundary:** Reuse the smallest useful unit (component, hook, workflow or adapter); preserve Ritewheel's domain data and API contracts.
7. **Attribution:** Keep required copyright, license and asset attribution notices with the adopted code or assets.
8. **Verification:** Add integration tests and verify the adapted flow in a preview before merging.

Prefer MIT, Apache-2.0 or BSD-licensed code where compatible with the project. GPL/AGPL or unclear terms require explicit review before adoption. A source-code license does not automatically cover bundled vehicle models, photos or other media.

## Initial candidates researched (19 November 2026)

| Ritewheel need | Candidate | What is reusable | Important limits |
|---|---|---|---|
| AI chat interface and floating launcher | [assistant-ui](https://github.com/assistant-ui/assistant-ui) | MIT React chat components, streaming, retries, accessibility, message/composer primitives and Vercel AI SDK integration | It is a UI/runtime adapter, not a hosted model or proof that the current provider backend works. Integrate with the current AI SDK major and reuse one runtime across the floating panel and full Concierge page. |
| AI photo-based car concepts | [customize-autos](https://github.com/noahjohnson0/customize-autos) | MIT Next.js flow: upload a car photo, choose component-aware modifications, generate an edited image and review/download it | Its published API route uses an older image model and lacks production-grade validation/rate limits. Reuse the interaction/prompt workflow, not its route as-is. Use a currently supported image model and add upload limits, abuse controls and usage disclosure. |
| AI car customization workflow reference | [Modbay](https://github.com/JonathanSouthern/Modbay) | Useful reference for prompt composition, optional vision-based instruction generation, multi-pass edits, quotas and build history | No repository license file was found during review; study the idea only, do not copy its source. |
| Asset-backed 3D studio | [FormDrive](https://github.com/nesdesignco/FormDrive) | MIT React/Three.js/React Three Fiber studio architecture, material controls, cameras, lighting and staged GLB loading | The included vehicle assets have separate CC BY 4.0 attribution requirements and only a few supported cars. Verify each asset before commercial use. |
| Next.js car configurator reference | [car-mod-saas](https://github.com/lukaizj/car-mod-saas) | Next.js/React Three Fiber/Blender GLB workflow, material mapping and configuration state | No explicit repository license was found in the review; use as architecture reference only. Its README distinguishes live material changes from body-part swaps that still need modular assets. |

## Architecture decisions for the current release

- Use a maintained React chat component for the Concierge front end. Do not build a new chat protocol or provider router while the basic single-provider request is still unverified.
- Prove one model provider end-to-end first: one request, one streamed answer, one inventory tool call, correct timeout and a useful error log. Add provider failover only when the primary flow is reliable and the fallback behavior is tested.
- Keep AI Concierge, Compare and Design Studio separate. Shared data may cross between them only through explicit customer actions (for example, opening Compare with selected vehicle IDs).
- Compare is a data-backed specification matrix. A generic HTML table is sufficient; reuse a table primitive only if it helps with responsive layout/accessibility. The vehicle database remains the source of truth.
- Design Studio starts with a photo-based visual concept workflow for broad creative changes. A 3D configurator is a separate capability that requires licensed GLB assets and verified material/part mappings per vehicle.
- Never let generated copy or images create vehicle specifications, inventory availability, fitment claims, prices or dealership commitments.

## Change control

Record each adopted component/repository, its license, version, local adaptations and attribution in the pull request. Review security-sensitive code separately. No external repository is copied wholesale without license review and a documented reason.
