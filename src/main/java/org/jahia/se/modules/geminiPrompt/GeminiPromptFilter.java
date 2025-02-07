package org.jahia.se.modules.geminiPrompt;

import net.htmlparser.jericho.*;
import org.jahia.services.content.JCRPropertyWrapper;
import org.jahia.services.content.JCRValueWrapper;
import org.jahia.services.content.decorator.JCRSiteNode;
import org.jahia.services.render.RenderContext;
import org.jahia.services.render.Resource;
import org.jahia.services.render.filter.AbstractFilter;
import org.jahia.services.render.filter.RenderChain;
import org.jahia.services.render.filter.RenderFilter;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.RepositoryException;
import javax.validation.constraints.NotNull;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@Component(service = RenderFilter.class, configurationPid = "org.jahia.se.modules.geminiPrompt", immediate = true)
public class GeminiPromptFilter extends AbstractFilter {
    private static final Logger logger = LoggerFactory.getLogger(GeminiPromptFilter.class);
    private final static String GEMINI_PROMPT_MODULE="gemini-ai-prompt";
    private final static String HOOK_PREFIX="JAHIA_GeminiPrompt_";
    private final static String HOOK_CTX_PREFIX=HOOK_PREFIX+"ctx_";
    private String GEMINI_TOKEN;
    private String GEMINI_MODEL;

    @Activate
    public void activate(Map<String, Object> config) {
        setPriority(-1);
        setApplyOnModes("live,preview");
        setApplyOnConfigurations("page");
        setApplyOnTemplateTypes("html,html-*");

        GEMINI_TOKEN = config.getOrDefault("gemini.apitoken", "").toString();
        GEMINI_MODEL = config.getOrDefault("gemini.model", "").toString();

        logger.info("Gemini Prompt Activated - API Token: [{}], Model: [{}]", GEMINI_TOKEN, GEMINI_MODEL);

        if (GEMINI_TOKEN.isEmpty() || GEMINI_MODEL.isEmpty()) {
            logger.error("Missing required configurations! Please check `org.jahia.se.modules.geminiPrompt.cfg`.");
        }
    }

    /**
     * Retrieves a configuration value as a string, with validation.
     *
     * @param config The configuration map.
     * @param key    The configuration key.
     * @return The configuration value as a string.
     * @throws IllegalArgumentException if the key is missing or the value is null.
     */
    private String getConfigValue(Map<String, Object> config, String key) {
        Object value = config.get(key);
        if (value == null) {
            logger.warn("Missing required configuration key: {}", key);
            return ""; // Return an empty string instead of throwing an exception
        }
        return String.valueOf(value);
    }

    /**
     * Validates the configuration map for required keys.
     *
     * @param config The configuration map to validate.
     */
    private void validateConfig(Map<String, String> config) {
        validateKey(config, "gemini.apitoken");
        validateKey(config, "gemini.model");
    }

    /**
     * Validates a single key in the configuration map.
     *
     * @param config The configuration map.
     * @param key    The key to validate.
     */
    private void validateKey(Map<String, String> config, String key) {
        if (!config.containsKey(key) || config.get(key) == null || config.get(key).isEmpty()) {
            throw new IllegalArgumentException(String.format("Missing or empty configuration key: %s", key));
        }
    }

    @Override
    public String execute(String previousOut, RenderContext renderContext, Resource resource, RenderChain chain) throws Exception {
        String output = super.execute(previousOut, renderContext, resource, chain);

        if(isInstalled(renderContext))
            output = enhanceOutput(output,renderContext,resource);

        return output;
    }

    /**
     * This Function is just to add some logic to our filter and therefore not needed to declare a filter
     *
     * @param output    Original output to modify
     * @return          Modified output
     */
    @NotNull
    private String enhanceOutput(String output, RenderContext renderContext, Resource resource) throws Exception{
        Source source = new Source(output);
        OutputDocument outputDocument = new OutputDocument(source);
        
        JCRSiteNode site = renderContext.getSite();
        String jsId = site.getIdentifier().replace('-','_');
        String hookId = HOOK_PREFIX+jsId;
        String contextId = HOOK_CTX_PREFIX+jsId;

        //Add webapp script to the beginning of the HEAD tag
        List<Element> elementList = source.getAllElements(HTMLElementName.HEAD);
        if (elementList != null && !elementList.isEmpty()) {
            final EndTag HeadEndTag = elementList.get(0).getEndTag();
            outputDocument.insert(HeadEndTag.getBegin(),getHeadScript());
        }

        //Add context script and html hook to the end of the BODY tag
        elementList = source.getAllElements(HTMLElementName.BODY);
        if (elementList != null && !elementList.isEmpty()) {
            final EndTag bodyEndTag = elementList.get(0).getEndTag();
            String bodyScriptAndHtml =  "\n<div id=\""+hookId+"\"></div>" + getBodyScript(renderContext, resource, contextId,hookId,site);
            outputDocument.insert(bodyEndTag.getBegin(),bodyScriptAndHtml);
        }

        output = outputDocument.toString().trim();
        return output;
    }

    private String getHeadScript() {
        StringBuilder headScriptBuilder =
                new StringBuilder( "\n<link href=\"https://fonts.googleapis.com/css?family=Lato:300,400,700,900\" rel=\"stylesheet\">" );
        headScriptBuilder.append( "\n<script type=\"text/javascript\" src=\"/modules/gemini-ai-prompt/javascript/webapp/geminiPrompt-vendors.js\"></script>" );
        headScriptBuilder.append( "\n<script type=\"text/javascript\" src=\"/modules/gemini-ai-prompt/javascript/webapp/geminiPrompt.js\"></script>\n");
        return headScriptBuilder.toString();
    }

    private String getBodyScript(RenderContext renderContext, Resource resource, String contextId, String hookId, JCRSiteNode site) throws RepositoryException, IOException {
        
        StringBuilder bodyScriptBuilder = new StringBuilder( "\n<script type=\"text/javascript\">" );
        bodyScriptBuilder.append("\n(function () {");
        bodyScriptBuilder.append("\n  const baseURL= window.location.protocol + '//' + window.location.host;");
        bodyScriptBuilder.append("\n  const "+contextId+" = {");
        bodyScriptBuilder.append("\n    locale: \""+resource.getLocale()+"\",");
        bodyScriptBuilder.append("\n    siteUUID: \""+site.getIdentifier()+"\",");
        bodyScriptBuilder.append("\n    siteName: \""+site.getName()+"\",");
        bodyScriptBuilder.append("\n    scope: \""+site.getSiteKey()+"\",");
        bodyScriptBuilder.append("\n    workspace: \""+renderContext.getWorkspace()+"\",");
        bodyScriptBuilder.append("\n    gqlServerUrl: `${baseURL}/modules/graphql`,");
        bodyScriptBuilder.append("\n    baseURL,");
        bodyScriptBuilder.append("\n    geminiToken: \""+GEMINI_TOKEN+"\",");
        bodyScriptBuilder.append("\n    geminiModel: \""+GEMINI_MODEL+"\",");
        bodyScriptBuilder.append("\n    contextServerUrl:window.digitalData?window.digitalData.contextServerPublicUrl:null,");//digitalData is set in live mode only
        bodyScriptBuilder.append("\n  };");
        bodyScriptBuilder.append("\n  window.jahiaGeminiPrompt(\""+hookId+"\", "+contextId+");");
        bodyScriptBuilder.append("\n})();");
        bodyScriptBuilder.append("\n</script>\n");
        return bodyScriptBuilder.toString();
    }

    private boolean isInstalled(RenderContext renderContext) throws RepositoryException {
        try {
            if (!renderContext.getSite().hasProperty("j:installedModules")) {
                logger.warn("Property j:installedModules is missing.");
                return false;
            }

            JCRPropertyWrapper installedModules = renderContext.getSite().getProperty("j:installedModules");

            for (JCRValueWrapper module : installedModules.getValues()) {
                if (GEMINI_PROMPT_MODULE.equals(module.getString())) {
                    return true;
                }
            }
        } catch (RepositoryException e) {
            logger.warn("Error checking if Gemini AI Prompt is installed: " + e.getMessage(), e);
        }
        return false;
    }

}